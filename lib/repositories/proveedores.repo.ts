import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Proveedores = Database["public"]["Tables"]["proveedores"];

export interface FiltrosProveedores {
  busqueda?: string;
  activo?: boolean;
  page?: number;
  pageSize?: number;
}

export class ProveedoresRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async listar(filtros: FiltrosProveedores = {}) {
    const { busqueda, activo, page = 1, pageSize = 25 } = filtros;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.supabase
      .from("proveedores")
      .select("*", { count: "exact" })
      .order("nombre", { ascending: true })
      .range(from, to);

    if (busqueda) {
      query = query.or(`nombre.ilike.%${busqueda}%,empresa.ilike.%${busqueda}%`);
    }
    if (activo !== undefined) {
      query = query.eq("activo", activo);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count: count ?? 0 };
  }

  async obtenerPorId(id: string) {
    const { data, error } = await this.supabase
      .from("proveedores")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  async crear(proveedor: Proveedores["Insert"]) {
    const { data, error } = await this.supabase
      .from("proveedores")
      .insert(proveedor)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async actualizar(id: string, cambios: Proveedores["Update"]) {
    const { data, error } = await this.supabase
      .from("proveedores")
      .update(cambios)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async darDeBaja(id: string) {
    const resultado = await this.actualizar(id, { activo: false });
    if (!resultado) {
      throw new Error("No se pudo desactivar el proveedor. Verifique que tiene permisos para realizar esta operación.");
    }
    return resultado;
  }

  /** Productos asociados a un proveedor (principal o alternativo) */
  async productosAsociados(proveedorId: string) {
    const { data, error } = await this.supabase
      .from("productos")
      .select("id, codigo_interno, nombre, precio_actual, stock_actual")
      .eq("proveedor_principal_id", proveedorId);
    if (error) throw error;
    return data;
  }

  /** Historial de compras a este proveedor, más recientes primero */
  async historialCompras(proveedorId: string, limite = 50) {
    const { data, error } = await this.supabase
      .from("compras")
      .select("id, fecha, numero_factura, total, estado_pago")
      .eq("proveedor_id", proveedorId)
      .order("fecha", { ascending: false })
      .limit(limite);
    if (error) throw error;
    return data;
  }

  /**
   * Totales agregados para la ficha del proveedor:
   * total comprado histórico, fecha de última compra y promedio mensual.
   * Se resuelve con una función SQL (ver services) para no traer todas las
   * filas al cliente cuando el historial es largo.
   */
  async resumenCompras(proveedorId: string) {
    const { data, error } = await this.supabase.rpc("fn_resumen_compras_proveedor", {
      p_proveedor_id: proveedorId,
    });
    if (error) throw error;
    return data;
  }
}
