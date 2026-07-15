import { z } from "zod";

export const eventoConsumoSchema = z.object({
  producto_id: z.string().uuid("Producto inválido"),
  cantidad: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
});

export const eventoSchema = z.object({
  cliente_nombre: z.string().min(2, "El nombre del cliente es obligatorio").max(200),
  cliente_telefono: z.string().max(30).optional().nullable(),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  hora: z.string().min(1, "La hora es obligatoria"),
  cantidad_ninos: z.coerce.number().int().min(0).default(0),
  cantidad_adultos: z.coerce.number().int().min(0).default(0),
  tematica: z.string().max(200).optional().nullable(),
  salon: z.string().max(100).optional().nullable(),
  estado_pago: z.enum(["pendiente", "parcial", "pagado", "cancelado"]).default("pendiente"),
  total_cobrado: z.coerce.number().min(0).default(0),
  // El consumo es opcional al crear el evento: muchos salones cargan el
  // consumo real el día del evento o al día siguiente, no en la reserva.
  consumos: z.array(eventoConsumoSchema).default([]),
});

export type EventoInput = z.infer<typeof eventoSchema>;
export type EventoConsumoInput = z.infer<typeof eventoConsumoSchema>;

// Para actualizar solo datos de cabecera (sin tocar consumos)
export const eventoUpdateSchema = eventoSchema.omit({ consumos: true }).partial();
export type EventoUpdateInput = z.infer<typeof eventoUpdateSchema>;
