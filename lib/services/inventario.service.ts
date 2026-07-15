import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { InventarioRepository, type FiltrosMovimientos } from "@/lib/repositories/inventario.repo";
import { ajusteInventarioSchema } from "@/lib/validators/inventario.schema";

export class StockInsuficienteAjusteError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "StockInsuficienteAjusteError";
  }
}

export class InventarioService {
  private repo: InventarioRepository;

  constructor(supabase: SupabaseClient<Database>) {
    this.repo = new InventarioRepository(supabase);
  }

  async listarMovimientos(filtros: FiltrosMovimientos) {
    return this.repo.listarMovimientos(filtros);
  }

  async registrarAjuste(input: unknown) {
    const datos = ajusteInventarioSchema.parse(input);
    try {
      return await this.repo.registrarAjuste(datos);
    } catch (error) {
      const mensaje = (error as Error).message ?? "";
      if (mensaje.toLowerCase().includes("stock insuficiente")) {
        throw new StockInsuficienteAjusteError(mensaje);
      }
      throw error;
    }
  }
}
