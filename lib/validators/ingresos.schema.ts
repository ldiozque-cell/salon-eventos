import { z } from "zod";

const ingresoBaseSchema = z.object({
  evento_id: z.string().uuid().optional().nullable().or(z.literal("")),
  tipo: z.enum(["reserva", "sena", "pago_final", "extra", "cancelacion", "reembolso"]),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  // Cancelaciones y reembolsos se cargan como importe negativo
  importe: z.coerce.number(),
  medio_pago: z
    .enum(["efectivo", "transferencia", "tarjeta_debito", "tarjeta_credito", "mercado_pago", "otro"])
    .optional()
    .nullable()
    .or(z.literal("")),
  observaciones: z.string().max(1000).optional().nullable(),
});

export const ingresoSchema = ingresoBaseSchema.refine(
  (data) => {
    const debeSerNegativo = data.tipo === "cancelacion" || data.tipo === "reembolso";
    return debeSerNegativo ? data.importe <= 0 : data.importe >= 0;
  },
  {
    message: "Cancelaciones y reembolsos deben cargarse con importe negativo o cero; el resto, positivo",
    path: ["importe"],
  }
);

export type IngresoInput = z.infer<typeof ingresoSchema>;

export const ingresoUpdateSchema = ingresoBaseSchema.partial();
export type IngresoUpdateInput = z.infer<typeof ingresoUpdateSchema>;
