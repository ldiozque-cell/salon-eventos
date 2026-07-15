import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export class EstadisticasRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async valorInventario() {
    const { data, error } = await this.supabase.from("vw_valor_inventario").select("*").single();
    if (error) throw error;
    return data;
  }

  async productosMayorAumento() {
    const { data, error } = await this.supabase.from("vw_productos_mayor_aumento").select("*");
    if (error) throw error;
    return data;
  }

  async productosMenosUtilizados() {
    const { data, error } = await this.supabase.from("vw_productos_menos_utilizados").select("*");
    if (error) throw error;
    return data;
  }

  async productosSinMovimiento() {
    const { data, error } = await this.supabase.from("vw_productos_sin_movimiento").select("*");
    if (error) throw error;
    return data;
  }

  async capitalInmovilizado() {
    const { data, error } = await this.supabase.from("vw_capital_inmovilizado").select("*").limit(15);
    if (error) throw error;
    return data;
  }

  async pronosticoReposicion() {
    const { data, error } = await this.supabase.from("vw_pronostico_reposicion").select("*").limit(15);
    if (error) throw error;
    return data;
  }

  async proyeccionGastos() {
    const { data, error } = await this.supabase.from("vw_proyeccion_gastos").select("*").single();
    if (error) throw error;
    return data;
  }

  async proyeccionCompras() {
    const { data, error } = await this.supabase.from("vw_proyeccion_compras").select("*").single();
    if (error) throw error;
    return data;
  }

  async costoPromedioEvento() {
    const { data, error } = await this.supabase
      .from("vw_costo_promedio_evento")
      .select("*")
      .order("fecha", { ascending: false })
      .limit(20);
    if (error) throw error;
    return data;
  }
}
