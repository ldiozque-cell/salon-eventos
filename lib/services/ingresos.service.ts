import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { IngresosRepository, type FiltrosIngresos } from "@/lib/repositories/ingresos.repo";
import { ingresoSchema, ingresoUpdateSchema } from "@/lib/validators/ingresos.schema";

export class IngresosService {
  private repo: IngresosRepository;

  constructor(supabase: SupabaseClient<Database>) {
    this.repo = new IngresosRepository(supabase);
  }

  async listar(filtros: FiltrosIngresos) {
    return this.repo.listar(filtros);
  }

  async obtener(id: string) {
    return this.repo.obtenerPorId(id);
  }

  async crear(input: unknown, registradoPor: string | null): Promise<{ id: string } | null> {
    const datos = ingresoSchema.parse(input);
    const ingreso = await this.repo.crear({
      evento_id: datos.evento_id || null,
      tipo: datos.tipo,
      fecha: datos.fecha,
      importe: datos.importe,
      medio_pago: datos.medio_pago || null,
      observaciones: datos.observaciones ?? null,
      registrado_por: registradoPor,
    });
    return ingreso ? { id: ingreso.id } : null;
  }

  async actualizar(id: string, input: unknown): Promise<{ id: string } | null> {
    const datos = ingresoUpdateSchema.parse(input);
    const ingreso = await this.repo.actualizar(id, {
      evento_id: datos.evento_id || null,
      tipo: datos.tipo,
      fecha: datos.fecha,
      importe: datos.importe,
      medio_pago: datos.medio_pago || null,
      observaciones: datos.observaciones ?? null,
    });
    return ingreso ? { id: ingreso.id } : null;
  }

  async eliminar(id: string) {
    return this.repo.eliminar(id);
  }

  async totalPeriodo(desde: string, hasta: string) {
    return this.repo.totalPeriodo(desde, hasta);
  }
}
