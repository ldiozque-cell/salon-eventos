import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Este repositorio NO hace cálculos en la app: todo se resuelve en vistas
 * SQL (ver supabase/migrations/00003_dashboard_views.sql) para que el
 * dashboard sea rápido y para que los números coincidan siempre con lo que
 * hay en la base, sin importar desde qué cliente se consulten.
 */
export class DashboardRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async indicadoresMesActual() {
    const { data, error } = await this.supabase.from("vw_dashboard_mes_actual").select("*").single();
    if (error) throw error;
    return data;
  }

  async evolucionMensual() {
    const { data, error } = await this.supabase.from("vw_evolucion_mensual").select("*");
    if (error) throw error;
    return data;
  }

  async gastosPorCategoriaMesActual() {
    const { data, error } = await this.supabase.from("vw_gastos_categoria_mes_actual").select("*");
    if (error) throw error;
    return data;
  }

  async productosMasUtilizados() {
    const { data, error } = await this.supabase.from("vw_productos_mas_utilizados").select("*");
    if (error) throw error;
    return data;
  }

  async proveedoresMayorVolumen() {
    const { data, error } = await this.supabase.from("vw_proveedores_mayor_volumen").select("*");
    if (error) throw error;
    return data;
  }

  async comprasSugeridas() {
    const { data, error } = await this.supabase.from("vw_compras_sugeridas").select("*").limit(8);
    if (error) throw error;
    return data;
  }

  async valorInventario() {
    const { data, error } = await this.supabase.from("vw_valor_inventario").select("*").single();
    if (error) throw error;
    return data;
  }

  async ultimosMovimientos(limite = 8) {
    const { data, error } = await this.supabase
      .from("movimientos_inventario")
      .select("*, productos(nombre)")
      .order("created_at", { ascending: false })
      .limit(limite);
    if (error) throw error;
    return data;
  }

  async comprasRecientes(limite = 5) {
    const { data, error } = await this.supabase
      .from("compras")
      .select("id, fecha, total, estado_pago, proveedores(nombre)")
      .order("fecha", { ascending: false })
      .limit(limite);
    if (error) throw error;
    return data;
  }
}
