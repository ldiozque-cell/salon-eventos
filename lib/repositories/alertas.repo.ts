import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface FiltrosAlertas {
  severidad?: string;
  tipo?: string;
  soloNoResueltas?: boolean;
}

export class AlertasRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async listar(filtros: FiltrosAlertas = {}): Promise<any[]> {
    const { severidad, tipo, soloNoResueltas = true } = filtros;

    let query = this.supabase
      .from("alertas")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (soloNoResueltas) query = query.eq("resuelta", false);
    if (severidad) query = query.eq("severidad", severidad);
    if (tipo) query = query.eq("tipo", tipo);

    const { data, error } = await query;
    if (error) throw error;
    return (data as any[]) ?? [];
  }

  async contarNoLeidas(): Promise<number> {
    const { count, error } = await this.supabase
      .from("alertas")
      .select("*", { count: "exact", head: true })
      .eq("leida", false)
      .eq("resuelta", false);
    if (error) throw error;
    return count ?? 0;
  }

  async marcarLeida(id: string): Promise<void> {
    const { error } = await this.supabase.from("alertas").update({ leida: true }).eq("id", id);
    if (error) throw error;
  }

  async marcarResuelta(id: string): Promise<void> {
    const { error } = await this.supabase.from("alertas").update({ resuelta: true, leida: true }).eq("id", id);
    if (error) throw error;
  }

  /**
   * Eventos con saldo pendiente cuya fecha está a 7 días o menos (o ya
   * pasó y sigue sin saldarse). No se persiste como fila en `alertas`
   * porque es una condición que depende del paso del tiempo, no de un
   * evento discreto — se recalcula en cada carga de la página.
   */
  async eventosConSaldoPendienteProximos(): Promise<any[]> {
    const limite = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data, error } = await this.supabase
      .from("eventos")
      .select("id, cliente_nombre, fecha, total_cobrado, estado_pago")
      .in("estado_pago", ["pendiente", "parcial"])
      .lte("fecha", limite)
      .order("fecha", { ascending: true });
    if (error) throw error;
    return (data as any[]) ?? [];
  }
}
