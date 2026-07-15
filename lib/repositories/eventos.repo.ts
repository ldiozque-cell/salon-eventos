import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Eventos = Database["public"]["Tables"]["eventos"];

export interface FiltrosEventos {
  desde?: string;
  hasta?: string;
  estadoPago?: Eventos["Row"]["estado_pago"];
  page?: number;
  pageSize?: number;
}

export class EventosRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async listar(filtros: FiltrosEventos = {}) {
    const { desde, hasta, estadoPago, page = 1, pageSize = 25 } = filtros;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.supabase
      .from("eventos")
      .select("*", { count: "exact" })
      .order("fecha", { ascending: false })
      .order("hora", { ascending: false })
      .range(from, to);

    if (desde) query = query.gte("fecha", desde);
    if (hasta) query = query.lte("fecha", hasta);
    if (estadoPago) query = query.eq("estado_pago", estadoPago);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count: count ?? 0 };
  }

  async obtenerPorId(id: string) {
    const { data, error } = await this.supabase
      .from("eventos")
      .select("*, evento_consumos(*, productos(nombre, codigo_interno, precio_actual)), ingresos(*)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  async crear(evento: Eventos["Insert"]): Promise<Events["Row"] | null> {
    const { data, error } = await this.supabase.from("eventos").insert(evento).select().maybeSingle();
    if (error) throw error;
    return data;
  }

  async actualizar(id: string, cambios: Eventos["Update"]): Promise<Events["Row"] | null> {
    const { data, error } = await this.supabase
      .from("eventos")
      .update(cambios)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Inserta consumos uno por uno (secuencial, no en batch): cada insert
   * dispara fn_evento_consumo_after_insert, que valida stock disponible y
   * lo descuenta. Insertarlos en paralelo generaría condiciones de carrera
   * sobre el mismo producto.
   */
  async agregarConsumos(eventoId: string, items: { producto_id: string; cantidad: number }[]) {
    const resultados = [];
    for (const item of items) {
      const { data, error } = await this.supabase
        .from("evento_consumos")
        .insert({ evento_id: eventoId, producto_id: item.producto_id, cantidad: item.cantidad })
        .select()
        .single();
      if (error) throw error;
      resultados.push(data);
    }
    return resultados;
  }

  async eventosProximos(dias = 14) {
    const hoy = new Date().toISOString().slice(0, 10);
    const limite = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data, error } = await this.supabase
      .from("eventos")
      .select("*")
      .gte("fecha", hoy)
      .lte("fecha", limite)
      .order("fecha", { ascending: true });
    if (error) throw error;
    return data;
  }
}
