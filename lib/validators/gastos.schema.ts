import { z } from "zod";

export const gastoSchema = z.object({
  fecha: z.string().min(1, "La fecha es obligatoria"),
  categoria: z.enum([
    "alimentos",
    "bebidas",
    "limpieza",
    "decoracion",
    "personal",
    "servicios",
    "publicidad",
    "reparaciones",
    "impuestos",
    "otros",
  ]),
  proveedor_id: z.string().uuid().optional().nullable().or(z.literal("")),
  concepto: z.string().min(2, "El concepto es obligatorio").max(300),
  importe: z.coerce.number().min(0, "El importe no puede ser negativo"),
  medio_pago: z
    .enum(["efectivo", "transferencia", "tarjeta_debito", "tarjeta_credito", "mercado_pago", "otro"])
    .optional()
    .nullable()
    .or(z.literal("")),
  observaciones: z.string().max(1000).optional().nullable(),
});

export type GastoInput = z.infer<typeof gastoSchema>;

export const gastoUpdateSchema = gastoSchema.partial();
export type GastoUpdateInput = z.infer<typeof gastoUpdateSchema>;
