import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export class EstadisticasRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async valorInventario(): Promise<any | null> {
    const { data, error } = await this.supabase.from("vw_valor_inventario").select("*").maybeSingle();
    if (error) throw error;
    return data ?? null;
  }

  async productosMayorAumento(): Promise<any[]> {
    const { data, error } = await this.supabase.from("vw_productos_mayor_aumento").select("*");
    if (error) throw error;
    return (data as any[]) ?? [];
  }

  async productosMenosUtilizados(): Promise<any[]> {
    const { data, error } = await this.supabase.from("vw_productos_menos_utilizados").select("*");
    if (error) throw error;
    return (data as any[]) ?? [];
  }

  async productosSinMovimiento(): Promise<any[]> {
    const { data, error } = await this.supabase.from("vw_productos_sin_movimiento").select("*");
    if (error) throw error;
    return (data as any[]) ?? [];
  }

  async capitalInmovilizado(): Promise<any[]> {
    const { data, error } = await this.supabase.from("vw_capital_inmovilizado").select("*").limit(15);
    if (error) throw error;
    return (data as any[]) ?? [];
  }

  async pronosticoReposicion(): Promise<any[]> {
    const { data, error } = await this.supabase.from("vw_pronostico_reposicion").select("*").limit(15);
    if (error) throw error;
    return (data as any[]) ?? [];
  }

  async proyeccionGastos(): Promise<any | null> {
    const { data, error } = await this.supabase.from("vw_proyeccion_gastos").select("*").maybeSingle();
    if (error) throw error;
    return data ?? null;
  }

  async proyeccionCompras(): Promise<any | null> {
    const { data, error } = await this.supabase.from("vw_proyeccion_compras").select("*").maybeSingle();
    if (error) throw error;
    return data ?? null;
  }

  async costoPromedioEvento(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("vw_costo_promedio_evento")
      .select("*")
      .order("fecha", { ascending: false })
      .limit(20);
    if (error) throw error;
    return (data as any[]) ?? [];
  }
}
