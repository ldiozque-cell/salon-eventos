"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { InventarioService, StockInsuficienteAjusteError } from "@/lib/services/inventario.service";
import type { ActionResult } from "@/app/(dashboard)/productos/actions";

function manejarError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    return { ok: false, error: "Datos inválidos", fieldErrors: error.flatten().fieldErrors };
  }
  if (error instanceof StockInsuficienteAjusteError) {
    return { ok: false, error: error.message };
  }
  console.error(error);
  return { ok: false, error: "Ocurrió un error al registrar el ajuste. Intentá de nuevo." };
}

export async function registrarAjusteInventarioAction(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No autenticado" };

    const service = new InventarioService(supabase);
    const input = Object.fromEntries(formData.entries());
    await service.registrarAjuste(input);

    revalidatePath("/inventario/movimientos");
    revalidatePath("/productos");
    revalidatePath("/dashboard");
    return { ok: true, data: undefined };
  } catch (error) {
    return manejarError(error);
  }
}
