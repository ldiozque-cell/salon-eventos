"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AlertasService } from "@/lib/services/alertas.service";
import type { ActionResult } from "@/app/(dashboard)/productos/actions";

export async function marcarAlertaLeidaAction(id: string): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No autenticado" };

    const service = new AlertasService(supabase);
    await service.marcarLeida(id);

    revalidatePath("/alertas");
    return { ok: true, data: undefined };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "No se pudo actualizar la alerta" };
  }
}

export async function marcarAlertaResueltaAction(id: string): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No autenticado" };

    const service = new AlertasService(supabase);
    await service.marcarResuelta(id);

    revalidatePath("/alertas");
    revalidatePath("/dashboard");
    return { ok: true, data: undefined };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "No se pudo resolver la alerta" };
  }
}
