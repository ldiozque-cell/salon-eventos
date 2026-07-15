import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { EventosRepository, type FiltrosEventos } from "@/lib/repositories/eventos.repo";
import { eventoSchema, eventoUpdateSchema } from "@/lib/validators/eventos.schema";

export class StockInsuficienteEventoError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "StockInsuficienteEventoError";
  }
}

export class EventosService {
  private repo: EventosRepository;

  constructor(supabase: SupabaseClient<Database>) {
    this.repo = new EventosRepository(supabase);
  }

  async listar(filtros: FiltrosEventos) {
    return this.repo.listar(filtros);
  }

  async obtener(id: string) {
    return this.repo.obtenerPorId(id);
  }

  async eventosProximos() {
    return this.repo.eventosProximos();
  }

  /**
   * Crea el evento y, si vino con consumo de productos ya cargado, lo
   * agrega descontando stock (Módulo 7: el descuento es automático vía
   * trigger, este método solo orquesta el orden de inserción).
   */
  async crear(input: unknown, registradoPor: string | null) {
    const datos = eventoSchema.parse(input);

    const evento = await this.repo.crear({
      cliente_nombre: datos.cliente_nombre,
      cliente_telefono: datos.cliente_telefono ?? null,
      fecha: datos.fecha,
      hora: datos.hora,
      cantidad_ninos: datos.cantidad_ninos,
      cantidad_adultos: datos.cantidad_adultos,
      tematica: datos.tematica ?? null,
      salon: datos.salon ?? null,
      estado_pago: datos.estado_pago,
      total_cobrado: datos.total_cobrado,
      registrado_por: registradoPor,
    });

    if (datos.consumos.length > 0) {
      try {
        await this.repo.agregarConsumos(evento.id, datos.consumos);
      } catch (error) {
        const mensaje = (error as Error).message ?? "";
        if (mensaje.toLowerCase().includes("stock insuficiente")) {
          throw new StockInsuficienteEventoError(
            `El evento se creó, pero no se pudo cargar todo el consumo: ${mensaje}`
          );
        }
        throw error;
      }
    }

    return evento;
  }

  async actualizar(id: string, input: unknown) {
    const datos = eventoUpdateSchema.parse(input);
    return this.repo.actualizar(id, datos);
  }

  /** Agregar consumo a un evento ya existente (ej: el día del evento) */
  async agregarConsumo(eventoId: string, items: { producto_id: string; cantidad: number }[]) {
    try {
      return await this.repo.agregarConsumos(eventoId, items);
    } catch (error) {
      const mensaje = (error as Error).message ?? "";
      if (mensaje.toLowerCase().includes("stock insuficiente")) {
        throw new StockInsuficienteEventoError(mensaje);
      }
      throw error;
    }
  }
}
