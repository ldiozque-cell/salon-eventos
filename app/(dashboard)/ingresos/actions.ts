"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { IngresosService } from "@/lib/services/ingresos.service";
import type { ActionResult } from "@/app/(dashboard)/productos/actions";

function manejarError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    return { ok: false, error: "Datos inválidos", fieldErrors: error.flatten().fieldErrors };
  }
  console.error(error);
  return { ok: false, error: "Ocurrió un error inesperado. Intentá de nuevo." };
}

export async function crearIngresoAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No autenticado" };

    const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
    if (perfil?.rol !== "admin") {
      return { ok: false, error: "Solo un administrador puede registrar ingresos" };
    }

    const service = new IngresosService(supabase);
    const input = Object.fromEntries(formData.entries());
    const ingreso = await service.crear(input, user.id);

    revalidatePath("/ingresos");
    revalidatePath("/balance");
    revalidatePath("/dashboard");
    if (input.evento_id) revalidatePath(`/eventos/${input.evento_id}`);
    return { ok: true, data: { id: ingreso.id } };
  } catch (error) {
    return manejarError(error);
  }
}
