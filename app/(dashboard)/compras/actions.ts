"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ComprasService, StockInsuficienteError } from "@/lib/services/compras.service";
import { manejarError, verificarAdmin } from "@/lib/actions-utils";
import type { ActionResult } from "@/app/(dashboard)/productos/actions";

/**
 * El formulario de compra tiene una lista dinámica de items (producto,
 * cantidad, precio). Se serializan como JSON en un campo oculto del form
 * (ver componente NuevaCompraForm) porque FormData no representa bien
 * arrays de objetos anidados.
 */
export async function registrarCompraAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createClient();
    const auth = await verificarAdmin(supabase);
    if (!auth.ok) return { ok: false, error: auth.error! };

    const itemsRaw = formData.get("items");
    const items = itemsRaw ? JSON.parse(itemsRaw.toString()) : [];

    const input = {
      fecha: formData.get("fecha"),
      numero_factura: formData.get("numero_factura") || null,
      proveedor_id: formData.get("proveedor_id"),
      iva: formData.get("iva") || 0,
      forma_pago: formData.get("forma_pago") || null,
      estado_pago: formData.get("estado_pago") || "pendiente",
      observaciones: formData.get("observaciones") || null,
      items,
    };

    const service = new ComprasService(supabase);
    const compra = await service.registrar(input, auth.userId);

    revalidatePath("/compras");
    revalidatePath("/productos");
    revalidatePath("/dashboard");
    return { ok: true, data: { id: compra.id } };
  } catch (error) {
    if (error instanceof StockInsuficienteError) {
      return { ok: false, error: error.message };
    }
    return manejarError(error);
  }
}

/** Variante que redirige directo al detalle de la compra creada (uso desde el form) */
export async function registrarCompraYRedirigirAction(formData: FormData) {
  const resultado = await registrarCompraAction(formData);
  if (resultado.ok) {
    redirect(`/compras/${resultado.data.id}`);
  }
  return resultado;
}

export async function actualizarEstadoPagoCompraAction(
  id: string,
  estadoPago: "pendiente" | "parcial" | "pagado" | "cancelado"
): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const auth = await verificarAdmin(supabase);
    if (!auth.ok) return { ok: false, error: auth.error! };

    const service = new ComprasService(supabase);
    await service.actualizarEstadoPago(id, estadoPago);

    revalidatePath("/compras");
    revalidatePath(`/compras/${id}`);
    return { ok: true, data: undefined };
  } catch (error) {
    return manejarError(error);
  }
}
