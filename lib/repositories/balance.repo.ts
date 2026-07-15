import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export class BalanceRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async evolucionMensual(): Promise<any[]> {
    const { data, error } = await this.supabase.from("vw_evolucion_mensual").select("*");
    if (error) throw error;
    return (data as any[]) ?? [];
  }

  async comparacionMensual(): Promise<any | null> {
    const { data, error } = await this.supabase.from("vw_balance_comparacion_mensual").select("*").maybeSingle();
    if (error) throw error;
    return data ?? null;
  }

  async balanceAnual(): Promise<any[]> {
    const { data, error } = await this.supabase.from("vw_balance_anual").select("*");
    if (error) throw error;
    return (data as any[]) ?? [];
  }
}
