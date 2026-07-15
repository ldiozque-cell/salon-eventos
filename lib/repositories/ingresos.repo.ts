import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Ingresos = Database["public"]["Tables"]["ingresos"];

export interface FiltrosIngresos {
  tipo?: string;
  eventoId?: string;
  desde?: string;
  hasta?: string;
  page?: number;
  pageSize?: number;
}

export class IngresosRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async listar(filtros: FiltrosIngresos = {}) {
    const { tipo, eventoId, desde, hasta, page = 1, pageSize = 30 } = filtros;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.supabase
      .from("ingresos")
      .select("*, eventos(cliente_nombre)", { count: "exact" })
      .order("fecha", { ascending: false })
      .range(from, to);

    if (tipo) query = query.eq("tipo", tipo);
    if (eventoId) query = query.eq("evento_id", eventoId);
    if (desde) query = query.gte("fecha", desde);
    if (hasta) query = query.lte("fecha", hasta);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count: count ?? 0 };
  }

  async crear(ingreso: Ingresos["Insert"]) {
    const { data, error } = await this.supabase.from("ingresos").insert(ingreso).select().single();
    if (error) throw error;
    return data;
  }

  async totalPeriodo(desde: string, hasta: string) {
    const { data, error } = await this.supabase
      .from("ingresos")
      .select("importe")
      .gte("fecha", desde)
      .lte("fecha", hasta);
    if (error) throw error;
    return data.reduce((acc, i) => acc + i.importe, 0);
  }
}
