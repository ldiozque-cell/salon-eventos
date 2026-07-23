"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { GastosService } from "@/lib/services/gastos.service";
import { manejarError, verificarAdmin } from "@/lib/actions-utils";
import type { ActionResult } from "@/app/(dashboard)/productos/actions";

export async function crearGastoAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createClient();
    const auth = await verificarAdmin(supabase);
    if (!auth.ok) return { ok: false, error: auth.error! };

    const service = new GastosService(supabase);
    const input = Object.fromEntries(formData.entries());
    const gasto = await service.crear(input, auth.userId);

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
    const auth = await verificarAdmin(supabase);
    if (!auth.ok) return { ok: false, error: auth.error! };

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
    const auth = await verificarAdmin(supabase);
    if (!auth.ok) return { ok: false, error: auth.error! };

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
