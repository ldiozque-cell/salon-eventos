"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { EventosService, StockInsuficienteEventoError } from "@/lib/services/eventos.service";
import type { ActionResult } from "@/app/(dashboard)/productos/actions";

function manejarError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    return { ok: false, error: "Datos inválidos", fieldErrors: error.flatten().fieldErrors };
  }
  if (error instanceof StockInsuficienteEventoError) {
    return { ok: false, error: error.message };
  }
  console.error(error);
  return { ok: false, error: "Ocurrió un error inesperado. Intentá de nuevo." };
}

export async function crearEventoAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No autenticado" };

    const consumosRaw = formData.get("consumos");
    const consumos = consumosRaw ? JSON.parse(consumosRaw.toString()) : [];

    const input = {
      cliente_nombre: formData.get("cliente_nombre"),
      cliente_telefono: formData.get("cliente_telefono") || null,
      fecha: formData.get("fecha"),
      hora: formData.get("hora"),
      cantidad_ninos: formData.get("cantidad_ninos") || 0,
      cantidad_adultos: formData.get("cantidad_adultos") || 0,
      tematica: formData.get("tematica") || null,
      salon: formData.get("salon") || null,
      estado_pago: formData.get("estado_pago") || "pendiente",
      total_cobrado: formData.get("total_cobrado") || 0,
      consumos,
    };

    const service = new EventosService(supabase);
    const evento = await service.crear(input, user.id);

    revalidatePath("/eventos");
    revalidatePath("/productos");
    revalidatePath("/dashboard");
    return { ok: true, data: { id: evento?.id ?? "" } };
  } catch (error) {
    return manejarError(error);
  }
}

export async function actualizarEventoAction(
  id: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No autenticado" };

    const service = new EventosService(supabase);
    const input = Object.fromEntries(formData.entries());
    const evento = await service.actualizar(id, input);

    revalidatePath("/eventos");
    revalidatePath(`/eventos/${id}`);
    return { ok: true, data: { id: evento.id } };
  } catch (error) {
    return manejarError(error);
  }
}

/** Agrega consumo de productos a un evento ya creado (el día del evento) */
export async function agregarConsumoEventoAction(
  eventoId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No autenticado" };

    const itemsRaw = formData.get("items");
    const items = itemsRaw ? JSON.parse(itemsRaw.toString()) : [];

    const service = new EventosService(supabase);
    await service.agregarConsumo(eventoId, items);

    revalidatePath(`/eventos/${eventoId}`);
    revalidatePath("/productos");
    revalidatePath("/dashboard");
    return { ok: true, data: undefined };
  } catch (error) {
    return manejarError(error);
  }
}
