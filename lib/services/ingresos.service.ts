import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { IngresosRepository, type FiltrosIngresos } from "@/lib/repositories/ingresos.repo";
import { ingresoSchema } from "@/lib/validators/ingresos.schema";

export class IngresosService {
  private repo: IngresosRepository;

  constructor(supabase: SupabaseClient<Database>) {
    this.repo = new IngresosRepository(supabase);
  }

  async listar(filtros: FiltrosIngresos) {
    return this.repo.listar(filtros);
  }

  async crear(input: unknown, registradoPor: string | null) {
    const datos = ingresoSchema.parse(input);
    return this.repo.crear({
      evento_id: datos.evento_id || null,
      tipo: datos.tipo,
      fecha: datos.fecha,
      importe: datos.importe,
      medio_pago: datos.medio_pago || null,
      observaciones: datos.observaciones ?? null,
      registrado_por: registradoPor,
    });
  }

  async totalPeriodo(desde: string, hasta: string) {
    return this.repo.totalPeriodo(desde, hasta);
  }
}
