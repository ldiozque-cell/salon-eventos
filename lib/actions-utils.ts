import { ZodError } from "zod";
import type { ActionResult } from "@/app/(dashboard)/productos/actions";

export function manejarError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    return { ok: false, error: "Datos inválidos", fieldErrors: error.flatten().fieldErrors };
  }
  console.error(error);
  return { ok: false, error: "Ocurrió un error inesperado. Intentá de nuevo." };
}

export async function verificarAdmin(supabase: { auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> }; from: (table: string) => { select: (cols: string) => { eq: (col: string, val: string) => { single: () => Promise<{ data: { rol: string } | null }> } } } }): Promise<{ ok: boolean; error?: string; userId?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
  if (perfil?.rol !== "admin") {
    return { ok: false, error: "Solo un administrador puede realizar esta acción" };
  }

  return { ok: true, userId: user.id };
}
