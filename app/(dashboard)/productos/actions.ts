"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ProductosService } from "@/lib/services/productos.service";
import { manejarError, verificarAdmin } from "@/lib/actions-utils";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export async function crearProductoAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createClient();
    const auth = await verificarAdmin(supabase);
    if (!auth.ok) return { ok: false, error: auth.error! };

    const service = new ProductosService(supabase);
    const input = Object.fromEntries(formData.entries());
    const producto = await service.crear(input);

    revalidatePath("/productos");
    return { ok: true, data: { id: producto?.id ?? "" } };
  } catch (error) {
    return manejarError(error);
  }
}

export async function actualizarProductoAction(
  id: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createClient();
    const auth = await verificarAdmin(supabase);
    if (!auth.ok) return { ok: false, error: auth.error! };

    const service = new ProductosService(supabase);
    const input = Object.fromEntries(formData.entries());
    const producto = await service.actualizar(id, input);

    revalidatePath("/productos");
    revalidatePath(`/productos/${id}`);
    return { ok: true, data: { id: producto?.id ?? id } };
  } catch (error) {
    return manejarError(error);
  }
}

export async function darDeBajaProductoAction(id: string): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const auth = await verificarAdmin(supabase);
    if (!auth.ok) return { ok: false, error: auth.error! };

    const service = new ProductosService(supabase);
    await service.darDeBaja(id);

    revalidatePath("/productos");
    return { ok: true, data: undefined };
  } catch (error) {
    return manejarError(error);
  }
}
