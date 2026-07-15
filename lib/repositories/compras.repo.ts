import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Compras = Database["public"]["Tables"]["compras"];
type CompraItems = Database["public"]["Tables"]["compra_items"];

export interface FiltrosCompras {
  proveedorId?: string;
  desde?: string;
  hasta?: string;
  estadoPago?: Compras["Row"]["estado_pago"];
  page?: number;
  pageSize?: number;
}

export class ComprasRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async listar(filtros: FiltrosCompras = {}) {
    const { proveedorId, desde, hasta, estadoPago, page = 1, pageSize = 25 } = filtros;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.supabase
      .from("compras")
      .select("*, proveedores(nombre)", { count: "exact" })
      .order("fecha", { ascending: false })
      .range(from, to);

    if (proveedorId) query = query.eq("proveedor_id", proveedorId);
    if (desde) query = query.gte("fecha", desde);
    if (hasta) query = query.lte("fecha", hasta);
    if (estadoPago) query = query.eq("estado_pago", estadoPago);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count: count ?? 0 };
  }

  async obtenerPorId(id: string) {
    const { data, error } = await this.supabase
      .from("compras")
      .select("*, proveedores(nombre), compra_items(*, productos(nombre, codigo_interno))")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Crea la cabecera de la compra. Los items se insertan por separado
   * (ver crearItems) porque cada INSERT en compra_items dispara el trigger
   * fn_compra_item_after_insert que actualiza stock e historial de precio.
   * Insertarlos uno por uno, en vez de en batch, permite que cada trigger
   * corra con datos consistentes fila por fila.
   */
  async crearCabecera(compra: Compras["Insert"]) {
    const { data, error } = await this.supabase
      .from("compras")
      .insert(compra)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async crearItems(items: CompraItems["Insert"][]) {
    const resultados = [];
    // Insert secuencial intencional: cada fila dispara un trigger que lee y
    // escribe stock_actual del producto: en paralelo se pisarían los valores.
    for (const item of items) {
      const { data, error } = await this.supabase
        .from("compra_items")
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      resultados.push(data);
    }
    return resultados;
  }

  async actualizarCabecera(id: string, cambios: Compras["Update"]) {
    const { data, error } = await this.supabase
      .from("compras")
      .update(cambios)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async actualizarTotales(id: string, subtotal: number, iva: number, total: number) {
    return this.actualizarCabecera(id, { subtotal, iva, total });
  }
}
