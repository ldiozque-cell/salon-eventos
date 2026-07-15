"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ProveedoresService } from "@/lib/services/proveedores.service";
import type { ActionResult } from "@/app/(dashboard)/productos/actions";

function manejarError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    return { ok: false, error: "Datos inválidos", fieldErrors: error.flatten().fieldErrors };
  }
  console.error(error);
  return { ok: false, error: "Ocurrió un error inesperado. Intentá de nuevo." };
}

export async function crearProveedorAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No autenticado" };

    const service = new ProveedoresService(supabase);
    const input = Object.fromEntries(formData.entries());
    // El checkbox "activo" no viaja en el FormData si está destildado
    const proveedor = await service.crear({ ...input, activo: formData.get("activo") === "on" });

    revalidatePath("/proveedores");
    return { ok: true, data: { id: proveedor.id } };
  } catch (error) {
    return manejarError(error);
  }
}

export async function actualizarProveedorAction(
  id: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No autenticado" };

    const service = new ProveedoresService(supabase);
    const input = Object.fromEntries(formData.entries());
    const proveedor = await service.actualizar(id, { ...input, activo: formData.get("activo") === "on" });

    revalidatePath("/proveedores");
    revalidatePath(`/proveedores/${id}`);
    return { ok: true, data: { id: proveedor.id } };
  } catch (error) {
    return manejarError(error);
  }
}

export async function darDeBajaProveedorAction(id: string): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No autenticado" };

    const service = new ProveedoresService(supabase);
    await service.darDeBaja(id);

    revalidatePath("/proveedores");
    return { ok: true, data: undefined };
  } catch (error) {
    return manejarError(error);
  }
}
