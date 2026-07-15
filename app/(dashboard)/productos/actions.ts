"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ProductosService, ProductoDuplicadoError } from "@/lib/services/productos.service";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

function manejarError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    return { ok: false, error: "Datos inválidos", fieldErrors: error.flatten().fieldErrors };
  }
  if (error instanceof ProductoDuplicadoError) {
    return { ok: false, error: error.message };
  }
  console.error(error);
  return { ok: false, error: "Ocurrió un error inesperado. Intentá de nuevo." };
}

export async function crearProductoAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No autenticado" };

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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No autenticado" };

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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No autenticado" };

    const service = new ProductosService(supabase);
    await service.darDeBaja(id);

    revalidatePath("/productos");
    return { ok: true, data: undefined };
  } catch (error) {
    return manejarError(error);
  }
}
