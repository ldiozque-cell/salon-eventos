"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { IngresosService } from "@/lib/services/ingresos.service";
import { manejarError, verificarAdmin } from "@/lib/actions-utils";
import type { ActionResult } from "@/app/(dashboard)/productos/actions";

export async function crearIngresoAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createClient();
    const auth = await verificarAdmin(supabase);
    if (!auth.ok) return { ok: false, error: auth.error! };

    const service = new IngresosService(supabase);
    const input = Object.fromEntries(formData.entries());
    const ingreso = await service.crear(input, auth.userId);

    revalidatePath("/ingresos");
    revalidatePath("/balance");
    revalidatePath("/dashboard");
    if (input.evento_id) revalidatePath(`/eventos/${input.evento_id}`);
    return { ok: true, data: { id: ingreso.id } };
  } catch (error) {
    return manejarError(error);
  }
}

export async function actualizarIngresoAction(
  id: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createClient();
    const auth = await verificarAdmin(supabase);
    if (!auth.ok) return { ok: false, error: auth.error! };

    const service = new IngresosService(supabase);
    const input = Object.fromEntries(formData.entries());
    const ingreso = await service.actualizar(id, input);

    revalidatePath("/ingresos");
    revalidatePath("/balance");
    revalidatePath("/dashboard");
    if (input.evento_id) revalidatePath(`/eventos/${input.evento_id}`);
    return { ok: true, data: { id: ingreso?.id ?? id } };
  } catch (error) {
    return manejarError(error);
  }
}

export async function eliminarIngresoAction(id: string): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const auth = await verificarAdmin(supabase);
    if (!auth.ok) return { ok: false, error: auth.error! };

    const service = new IngresosService(supabase);
    await service.eliminar(id);

    revalidatePath("/ingresos");
    revalidatePath("/balance");
    revalidatePath("/dashboard");
    return { ok: true, data: undefined };
  } catch (error) {
    return manejarError(error);
  }
}
