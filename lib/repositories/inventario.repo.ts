import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { AjusteInventarioInput } from "@/lib/validators/inventario.schema";

export interface FiltrosMovimientos {
  productoId?: string;
  tipo?: string;
  desde?: string;
  hasta?: string;
  page?: number;
  pageSize?: number;
}

export class InventarioRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async listarMovimientos(filtros: FiltrosMovimientos = {}) {
    const { productoId, tipo, desde, hasta, page = 1, pageSize = 30 } = filtros;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.supabase
      .from("movimientos_inventario")
      .select("*, productos(nombre, codigo_interno), perfiles:usuario_id(nombre_completo)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (productoId) query = query.eq("producto_id", productoId);
    if (tipo) query = query.eq("tipo", tipo);
    if (desde) query = query.gte("created_at", desde);
    if (hasta) query = query.lte("created_at", hasta);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count: count ?? 0 };
  }

  /**
   * Llama a la función RPC que actualiza stock e inserta el movimiento en
   * una sola transacción de Postgres (ver migración 00004). No se hace un
   * insert directo a movimientos_inventario porque eso no movería el stock.
   */
  async registrarAjuste(input: AjusteInventarioInput) {
    const { data, error } = await this.supabase.rpc("fn_registrar_ajuste_inventario", {
      p_producto_id: input.producto_id,
      p_tipo: input.tipo,
      p_cantidad: input.cantidad,
      p_motivo: input.motivo,
    });
    if (error) throw error;
    return data;
  }
}
