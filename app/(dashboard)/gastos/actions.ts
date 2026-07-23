"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { GastosService } from "@/lib/services/gastos.service";
import type { ActionResult } from "@/app/(dashboard)/productos/actions";

function manejarError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    return { ok: false, error: "Datos inválidos", fieldErrors: error.flatten().fieldErrors };
  }
  console.error(error);
  return { ok: false, error: "Ocurrió un error inesperado. Intentá de nuevo." };
}

export async function crearGastoAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No autenticado" };

    // RLS ya bloquea el insert si no es admin, pero se valida acá también
    // para devolver un mensaje claro en vez de un error genérico de Postgres.
    const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
    if (perfil?.rol !== "admin") {
      return { ok: false, error: "Solo un administrador puede registrar gastos" };
    }

    const service = new GastosService(supabase);
    const input = Object.fromEntries(formData.entries());
    const gasto = await service.crear(input, user.id);

    revalidatePath("/gastos");
    revalidatePath("/balance");
    revalidatePath("/dashboard");
    return { ok: true, data: { id: gasto.id } };
  } catch (error) {
    return manejarError(error);
  }
}

export async function actualizarGastoAction(
  id: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No autenticado" };

    const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
    if (perfil?.rol !== "admin") {
      return { ok: false, error: "Solo un administrador puede editar gastos" };
    }

    const service = new GastosService(supabase);
    const input = Object.fromEntries(formData.entries());
    const gasto = await service.actualizar(id, input);

    revalidatePath("/gastos");
    revalidatePath("/balance");
    revalidatePath("/dashboard");
    return { ok: true, data: { id: gasto?.id ?? id } };
  } catch (error) {
    return manejarError(error);
  }
}

export async function eliminarGastoAction(id: string): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No autenticado" };

    const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
    if (perfil?.rol !== "admin") {
      return { ok: false, error: "Solo un administrador puede eliminar gastos" };
    }

    const service = new GastosService(supabase);
    await service.eliminar(id);

    revalidatePath("/gastos");
    revalidatePath("/balance");
    revalidatePath("/dashboard");
    return { ok: true, data: undefined };
  } catch (error) {
    return manejarError(error);
  }
}
