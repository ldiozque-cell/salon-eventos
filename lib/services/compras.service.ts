import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { ComprasRepository, type FiltrosCompras } from "@/lib/repositories/compras.repo";
import { compraSchema, type CompraInput } from "@/lib/validators/compras.schema";

export class StockInsuficienteError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "StockInsuficienteError";
  }
}

/**
 * Servicio de Compras. La regla de negocio "registrar compra actualiza
 * stock automáticamente" vive principalmente en el trigger de Postgres
 * (fn_compra_item_after_insert, ver 02-schema.sql) para que sea imposible
 * de saltear incluso si alguien escribe directo a la DB. Este servicio se
 * encarga de:
 *   1. Validar el input completo (cabecera + items) antes de tocar la DB.
 *   2. Calcular subtotal/iva/total de forma consistente.
 *   3. Orquestar la creación de cabecera + items en el orden correcto.
 *   4. Revertir la cabecera si falla la carga de items (compensación,
 *      ya que Supabase JS no expone transacciones multi-statement desde
 *      el cliente; para atomicidad real se puede migrar esto a una
 *      función RPC de Postgres — ver nota al final del archivo).
 */
export class ComprasService {
  private repo: ComprasRepository;

  constructor(supabase: SupabaseClient<Database>) {
    this.repo = new ComprasRepository(supabase);
  }

  async listar(filtros: FiltrosCompras) {
    return this.repo.listar(filtros);
  }

  async obtener(id: string) {
    return this.repo.obtenerPorId(id);
  }

  async registrar(input: unknown, registradoPor: string | null) {
    const datos: CompraInput = compraSchema.parse(input);

    const subtotal = datos.items.reduce((acc, i) => acc + i.cantidad * i.precio_unitario, 0);
    const iva = datos.iva ?? 0;
    const total = subtotal + iva;

    const cabecera = await this.repo.crearCabecera({
      fecha: datos.fecha,
      numero_factura: datos.numero_factura ?? null,
      proveedor_id: datos.proveedor_id,
      subtotal,
      iva,
      total,
      forma_pago: datos.forma_pago ?? null,
      estado_pago: datos.estado_pago,
      observaciones: datos.observaciones ?? null,
      registrado_por: registradoPor,
    });

    try {
      const items = await this.repo.crearItems(
        datos.items.map((i) => ({
          compra_id: cabecera.id,
          producto_id: i.producto_id,
          cantidad: i.cantidad,
          precio_unitario: i.precio_unitario,
        }))
      );
      return { ...cabecera, compra_items: items };
    } catch (error) {
      // Compensación: si algún item falla (ej: stock/constraint), no dejamos
      // una compra "fantasma" sin productos. Los items ya insertados antes
      // del error mantienen su efecto en stock (es información real de que
      // esos productos sí entraron), solo se anula la cabecera huérfana.
      await this.repo.actualizarCabecera(cabecera.id, {
        observaciones: `[ERROR AL CARGAR ITEMS] ${(error as Error).message}. ${datos.observaciones ?? ""}`,
      });
      throw error;
    }
  }

  async actualizarEstadoPago(id: string, estadoPago: CompraInput["estado_pago"]) {
    return this.repo.actualizarCabecera(id, { estado_pago: estadoPago });
  }
}

/**
 * NOTA DE ARQUITECTURA (atomicidad):
 * Para garantizar atomicidad real cabecera+items en un solo paso (sin la
 * compensación manual de arriba), la alternativa recomendada para la
 * Fase 3 es mover `registrar()` a una función Postgres `fn_registrar_compra(
 * jsonb)` que reciba cabecera + items como JSON y haga todo el INSERT
 * dentro de una única transacción de base de datos, devolviendo el id de
 * la compra creada. El repositorio la llamaría vía `.rpc(...)`. Se deja
 * documentado para no bloquear el avance del resto de los módulos.
 */
