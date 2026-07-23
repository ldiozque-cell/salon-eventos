"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ProveedoresService } from "@/lib/services/proveedores.service";
import { manejarError, verificarAdmin } from "@/lib/actions-utils";
import type { ActionResult } from "@/app/(dashboard)/productos/actions";

export async function crearProveedorAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createClient();
    const auth = await verificarAdmin(supabase);
    if (!auth.ok) return { ok: false, error: auth.error! };

    const service = new ProveedoresService(supabase);
    const input = Object.fromEntries(formData.entries());
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
    const auth = await verificarAdmin(supabase);
    if (!auth.ok) return { ok: false, error: auth.error! };

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
    const auth = await verificarAdmin(supabase);
    if (!auth.ok) return { ok: false, error: auth.error! };

    const service = new ProveedoresService(supabase);
    await service.darDeBaja(id);

    revalidatePath("/proveedores");
    return { ok: true, data: undefined };
  } catch (error) {
    return manejarError(error);
  }
}
