import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Gastos = Database["public"]["Tables"]["gastos"];

export interface FiltrosGastos {
  categoria?: string;
  desde?: string;
  hasta?: string;
  page?: number;
  pageSize?: number;
}

export class GastosRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async listar(filtros: FiltrosGastos = {}) {
    const { categoria, desde, hasta, page = 1, pageSize = 30 } = filtros;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.supabase
      .from("gastos")
      .select("*, proveedores(nombre)", { count: "exact" })
      .order("fecha", { ascending: false })
      .range(from, to);

    if (categoria) query = query.eq("categoria", categoria);
    if (desde) query = query.gte("fecha", desde);
    if (hasta) query = query.lte("fecha", hasta);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count: count ?? 0 };
  }

  async crear(gasto: Gastos["Insert"]) {
    const { data, error } = await this.supabase.from("gastos").insert(gasto).select().single();
    if (error) throw error;
    return data;
  }

  async totalPeriodo(desde: string, hasta: string) {
    const { data, error } = await this.supabase
      .from("gastos")
      .select("importe")
      .gte("fecha", desde)
      .lte("fecha", hasta);
    if (error) throw error;
    return data.reduce((acc, g) => acc + g.importe, 0);
  }
}
