import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { ProveedoresRepository, type FiltrosProveedores } from "@/lib/repositories/proveedores.repo";
import { proveedorSchema, proveedorUpdateSchema } from "@/lib/validators/proveedores.schema";

export class ProveedoresService {
  private repo: ProveedoresRepository;

  constructor(supabase: SupabaseClient<Database>) {
    this.repo = new ProveedoresRepository(supabase);
  }

  async listar(filtros: FiltrosProveedores) {
    return this.repo.listar(filtros);
  }

  async crear(input: unknown) {
    const datos = proveedorSchema.parse(input);
    // Normalizar email vacío a null para no violar el formato en la DB
    const email = datos.email === "" ? null : datos.email;
    return this.repo.crear({ ...datos, email });
  }

  async actualizar(id: string, input: unknown) {
    const datos = proveedorUpdateSchema.parse(input);
    const email = datos.email === "" ? null : datos.email;
    return this.repo.actualizar(id, { ...datos, email });
  }

  async darDeBaja(id: string) {
    return this.repo.darDeBaja(id);
  }

  /**
   * Ficha completa de proveedor: datos, productos asociados, historial de
   * compras y métricas agregadas (total comprado, promedio mensual, etc).
   * Se resuelven en paralelo porque son consultas independientes.
   */
  async obtenerFicha(id: string) {
    const [proveedor, productos, historial, resumen] = await Promise.all([
      this.repo.obtenerPorId(id),
      this.repo.productosAsociados(id),
      this.repo.historialCompras(id),
      this.repo.resumenCompras(id),
    ]);

    return { proveedor, productos, historial, resumen: resumen?.[0] ?? null };
  }
}
