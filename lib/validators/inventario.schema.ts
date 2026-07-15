import { z } from "zod";

// Tipos de movimiento que un usuario puede generar manualmente desde la UI.
// entrada_compra y salida_evento son siempre automáticos (vía triggers) y
// nunca se exponen en este formulario.
export const tipoAjusteManual = z.enum([
  "ajuste_positivo",
  "ajuste_negativo",
  "perdida",
  "rotura",
  "vencimiento",
]);

export const ajusteInventarioSchema = z.object({
  producto_id: z.string().uuid("Debe seleccionar un producto"),
  tipo: tipoAjusteManual,
  cantidad: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
  motivo: z.string().min(3, "Indicá un motivo para el ajuste").max(500),
});

export type AjusteInventarioInput = z.infer<typeof ajusteInventarioSchema>;
