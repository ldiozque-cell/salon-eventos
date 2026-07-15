import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export class BalanceRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async evolucionMensual() {
    const { data, error } = await this.supabase.from("vw_evolucion_mensual").select("*");
    if (error) throw error;
    return data;
  }

  async comparacionMensual() {
    const { data, error } = await this.supabase.from("vw_balance_comparacion_mensual").select("*").single();
    if (error) throw error;
    return data;
  }

  async balanceAnual() {
    const { data, error } = await this.supabase.from("vw_balance_anual").select("*");
    if (error) throw error;
    return data;
  }
}
