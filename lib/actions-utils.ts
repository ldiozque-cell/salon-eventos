import { ZodError } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { ActionResult } from "@/app/(dashboard)/productos/actions";

export class ProductoDuplicadoError extends Error {
  constructor(codigo: string) {
    super(`Ya existe un producto con el código interno "${codigo}"`);
    this.name = "ProductoDuplicadoError";
  }
}

export function manejarError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    return { ok: false, error: "Datos inválidos", fieldErrors: error.flatten().fieldErrors };
  }
  if (error instanceof ProductoDuplicadoError) {
    return { ok: false, error: error.message };
  }
  console.error(error);
  return { ok: false, error: "Ocurrió un error inesperado. Intentá de nuevo." };
}

export async function verificarAdmin(
  supabase: SupabaseClient<Database>
): Promise<{ ok: boolean; error?: string; userId?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const { data } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
  const perfil = data as { rol: string } | null;
  if (!perfil || perfil.rol !== "admin") {
    return { ok: false, error: "Solo un administrador puede realizar esta acción" };
  }

  return { ok: true, userId: user.id };
}
