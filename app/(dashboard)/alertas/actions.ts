"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AlertasService } from "@/lib/services/alertas.service";
import { manejarError, verificarAdmin } from "@/lib/actions-utils";
import type { ActionResult } from "@/app/(dashboard)/productos/actions";

export async function marcarAlertaLeidaAction(id: string): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const auth = await verificarAdmin(supabase);
    if (!auth.ok) return { ok: false, error: auth.error! };

    const service = new AlertasService(supabase);
    await service.marcarLeida(id);

    revalidatePath("/alertas");
    return { ok: true, data: undefined };
  } catch (error) {
    return manejarError(error);
  }
}

export async function marcarAlertaResueltaAction(id: string): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const auth = await verificarAdmin(supabase);
    if (!auth.ok) return { ok: false, error: auth.error! };

    const service = new AlertasService(supabase);
    await service.marcarResuelta(id);

    revalidatePath("/alertas");
    revalidatePath("/dashboard");
    return { ok: true, data: undefined };
  } catch (error) {
    return manejarError(error);
  }
}
