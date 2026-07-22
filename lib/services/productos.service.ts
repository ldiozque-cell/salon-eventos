import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { ProductosRepository, type FiltrosProductos } from "@/lib/repositories/productos.repo";
import { productoSchema, productoUpdateSchema } from "@/lib/validators/productos.schema";

export class ProductoDuplicadoError extends Error {
  constructor(codigo: string) {
    super(`Ya existe un producto con el código interno "${codigo}"`);
    this.name = "ProductoDuplicadoError";
  }
}

/**
 * Capa de servicio: valida input, aplica reglas de negocio y orquesta
 * llamadas al repositorio. No conoce Supabase directamente.
 */
export class ProductosService {
  private repo: ProductosRepository;

  constructor(supabase: SupabaseClient<Database>) {
    this.repo = new ProductosRepository(supabase);
  }

  async listar(filtros: FiltrosProductos) {
    return this.repo.listar(filtros);
  }

  async obtener(id: string) {
    return this.repo.obtenerPorId(id);
  }

  async crear(input: unknown): Promise<Pick<Database["public"]["Tables"]["productos"]["Row"], "id"> | null> {
    const datos = productoSchema.parse(input);

    const existente = await this.repo.obtenerPorCodigoInterno(datos.codigo_interno);
    if (existente) {
      throw new ProductoDuplicadoError(datos.codigo_interno);
    }

    return this.repo.crear(datos);
  }

  async actualizar(id: string, input: unknown): Promise<Pick<Database["public"]["Tables"]["productos"]["Row"], "id"> | null> {
    const datos = productoUpdateSchema.parse(input);

    if (datos.codigo_interno) {
      const existente = await this.repo.obtenerPorCodigoInterno(datos.codigo_interno);
      if (existente && existente.id !== id) {
        throw new ProductoDuplicadoError(datos.codigo_interno);
      }
    }

    return this.repo.actualizar(id, datos);
  }

  async darDeBaja(id: string) {
    return this.repo.darDeBaja(id);
  }

  async historialPrecios(id: string) {
    return this.repo.historialPrecios(id);
  }

  async historialMovimientos(id: string) {
    return this.repo.historialMovimientos(id);
  }

  /** Productos que deberían reponerse: stock <= stock_minimo y activos */
  async sugerenciasDeCompra() {
    const { data } = await this.repo.listar({ soloStockBajo: true, estado: "activo", pageSize: 100 });
    return data;
  }
}
