import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Productos = Database["public"]["Tables"]["productos"];

export interface FiltrosProductos {
  busqueda?: string;
  categoriaId?: string;
  estado?: "activo" | "inactivo";
  soloStockBajo?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * Repositorio: única capa que conoce las tablas de Supabase.
 * No contiene reglas de negocio, solo consultas.
 */
export class ProductosRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async listar(filtros: FiltrosProductos = {}) {
    const { busqueda, categoriaId, estado, soloStockBajo, page = 1, pageSize = 25 } = filtros;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.supabase
      .from("productos")
      .select("*", { count: "exact" })
      .order("nombre", { ascending: true })
      .range(from, to);

    if (busqueda) {
      query = query.ilike("nombre", `%${busqueda}%`);
    }
    if (categoriaId) {
      query = query.eq("categoria_id", categoriaId);
    }
    if (estado) {
      query = query.eq("estado", estado);
    }
    if (soloStockBajo) {
      // stock_actual <= stock_minimo (comparación entre columnas vía filter crudo)
      query = query.filter("stock_actual", "lte", "stock_minimo");
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count: count ?? 0 };
  }

  async obtenerPorId(id: string) {
    const { data, error } = await this.supabase
      .from("productos")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  async obtenerPorCodigoInterno(codigo: string) {
    const { data, error } = await this.supabase
      .from("productos")
      .select("id")
      .eq("codigo_interno", codigo)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async crear(producto: Productos["Insert"]): Promise<Pick<Productos["Row"], "id"> | null> {
    const { data, error } = await this.supabase
      .from("productos")
      .insert(producto)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async actualizar(id: string, cambios: Productos["Update"]): Promise<Pick<Productos["Row"], "id"> | null> {
    const { data, error } = await this.supabase
      .from("productos")
      .update(cambios)
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  /** Baja lógica: nunca se borra un producto con movimientos asociados */
  async darDeBaja(id: string) {
    return this.actualizar(id, { estado: "inactivo" });
  }

  async historialPrecios(productoId: string) {
    const { data, error } = await this.supabase
      .from("producto_precio_historial")
      .select("*")
      .eq("producto_id", productoId)
      .order("fecha", { ascending: false });
    if (error) throw error;
    return data;
  }

  async historialMovimientos(productoId: string, limite = 50) {
    const { data, error } = await this.supabase
      .from("movimientos_inventario")
      .select("*")
      .eq("producto_id", productoId)
      .order("created_at", { ascending: false })
      .limit(limite);
    if (error) throw error;
    return data;
  }
}
