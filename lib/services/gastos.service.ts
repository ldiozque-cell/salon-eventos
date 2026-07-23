import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { GastosRepository, type FiltrosGastos } from "@/lib/repositories/gastos.repo";
import { gastoSchema, gastoUpdateSchema } from "@/lib/validators/gastos.schema";

export class GastosService {
  private repo: GastosRepository;

  constructor(supabase: SupabaseClient<Database>) {
    this.repo = new GastosRepository(supabase);
  }

  async listar(filtros: FiltrosGastos) {
    return this.repo.listar(filtros);
  }

  async obtener(id: string) {
    return this.repo.obtenerPorId(id);
  }

  async crear(input: unknown, registradoPor: string | null): Promise<{ id: string } | null> {
    const datos = gastoSchema.parse(input);
    const gasto = await this.repo.crear({
      fecha: datos.fecha,
      categoria: datos.categoria,
      proveedor_id: datos.proveedor_id || null,
      concepto: datos.concepto,
      importe: datos.importe,
      medio_pago: datos.medio_pago || null,
      observaciones: datos.observaciones ?? null,
      registrado_por: registradoPor,
    });
    return gasto ? { id: gasto.id } : null;
  }

  async actualizar(id: string, input: unknown): Promise<{ id: string } | null> {
    const datos = gastoUpdateSchema.parse(input);
    const gasto = await this.repo.actualizar(id, {
      fecha: datos.fecha,
      categoria: datos.categoria,
      proveedor_id: datos.proveedor_id || null,
      concepto: datos.concepto,
      importe: datos.importe,
      medio_pago: datos.medio_pago || null,
      observaciones: datos.observaciones ?? null,
    });
    return gasto ? { id: gasto.id } : null;
  }

  async eliminar(id: string) {
    return this.repo.eliminar(id);
  }

  async totalPeriodo(desde: string, hasta: string) {
    return this.repo.totalPeriodo(desde, hasta);
  }
}
