import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { DashboardRepository } from "@/lib/repositories/dashboard.repo";

/**
 * Todas las consultas del dashboard son independientes entre sí, así que se
 * resuelven en paralelo con Promise.all para minimizar el tiempo de carga
 * de la página (son ~8 queries livianas contra vistas ya agregadas).
 */
export class DashboardService {
  private repo: DashboardRepository;

  constructor(supabase: SupabaseClient<Database>) {
    this.repo = new DashboardRepository(supabase);
  }

  async obtenerResumenCompleto() {
    const [
      indicadoresMes,
      evolucionMensual,
      gastosPorCategoria,
      productosMasUtilizados,
      proveedoresMayorVolumen,
      comprasSugeridas,
      valorInventario,
      ultimosMovimientos,
      comprasRecientes,
    ] = await Promise.all([
      this.repo.indicadoresMesActual(),
      this.repo.evolucionMensual(),
      this.repo.gastosPorCategoriaMesActual(),
      this.repo.productosMasUtilizados(),
      this.repo.proveedoresMayorVolumen(),
      this.repo.comprasSugeridas(),
      this.repo.valorInventario(),
      this.repo.ultimosMovimientos(),
      this.repo.comprasRecientes(),
    ]);

    return {
      indicadoresMes,
      evolucionMensual,
      gastosPorCategoria,
      productosMasUtilizados,
      proveedoresMayorVolumen,
      comprasSugeridas,
      valorInventario,
      ultimosMovimientos,
      comprasRecientes,
    };
  }
}
