"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { InventarioService, StockInsuficienteAjusteError } from "@/lib/services/inventario.service";
import { manejarError, verificarAdmin } from "@/lib/actions-utils";
import type { ActionResult } from "@/app/(dashboard)/productos/actions";

export async function registrarAjusteInventarioAction(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const auth = await verificarAdmin(supabase);
    if (!auth.ok) return { ok: false, error: auth.error! };

    const service = new InventarioService(supabase);
    const input = Object.fromEntries(formData.entries());
    await service.registrarAjuste(input);

    revalidatePath("/inventario/movimientos");
    revalidatePath("/productos");
    revalidatePath("/dashboard");
    return { ok: true, data: undefined };
  } catch (error) {
    if (error instanceof StockInsuficienteAjusteError) {
      return { ok: false, error: error.message };
    }
    return manejarError(error);
  }
}
