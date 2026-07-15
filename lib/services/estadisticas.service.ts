import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { EstadisticasRepository } from "@/lib/repositories/estadisticas.repo";

export class EstadisticasService {
  private repo: EstadisticasRepository;

  constructor(supabase: SupabaseClient<Database>) {
    this.repo = new EstadisticasRepository(supabase);
  }

  /**
   * Todas las consultas son vistas SQL ya agregadas, así que se resuelven
   * en paralelo. Ninguna hace cálculos pesados en el cliente: los
   * promedios, rankings y proyecciones ya vienen calculados desde Postgres.
   */
  async obtenerResumenCompleto() {
    const [
      valorInventario,
      productosMayorAumento,
      productosMenosUtilizados,
      productosSinMovimiento,
      capitalInmovilizado,
      pronosticoReposicion,
      proyeccionGastos,
      proyeccionCompras,
      costoPromedioEvento,
    ] = await Promise.all([
      this.repo.valorInventario(),
      this.repo.productosMayorAumento(),
      this.repo.productosMenosUtilizados(),
      this.repo.productosSinMovimiento(),
      this.repo.capitalInmovilizado(),
      this.repo.pronosticoReposicion(),
      this.repo.proyeccionGastos(),
      this.repo.proyeccionCompras(),
      this.repo.costoPromedioEvento(),
    ]);

    const costoPromedioEventoNum =
      costoPromedioEvento && costoPromedioEvento.length > 0
        ? costoPromedioEvento.reduce((acc, e) => acc + e.costo_insumos, 0) / costoPromedioEvento.length
        : 0;

    return {
      valorInventario,
      productosMayorAumento,
      productosMenosUtilizados,
      productosSinMovimiento,
      capitalInmovilizado,
      pronosticoReposicion,
      proyeccionGastos,
      proyeccionCompras,
      costoPromedioEventoNum,
      cantidadEventosConsiderados: costoPromedioEvento?.length ?? 0,
    };
  }
}
