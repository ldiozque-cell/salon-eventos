import { z } from "zod";

export const proveedorSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio").max(200),
  empresa: z.string().max(200).optional().nullable(),
  responsable: z.string().max(200).optional().nullable(),
  telefono: z.string().max(30).optional().nullable(),
  whatsapp: z.string().max(30).optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable().or(z.literal("")),
  direccion: z.string().max(300).optional().nullable(),
  ciudad: z.string().max(100).optional().nullable(),
  observaciones: z.string().max(1000).optional().nullable(),
  horarios_atencion: z.string().max(200).optional().nullable(),
  condiciones_pago: z.string().max(300).optional().nullable(),
  activo: z.boolean().default(true),
});

export type ProveedorInput = z.infer<typeof proveedorSchema>;

export const proveedorUpdateSchema = proveedorSchema.partial();
export type ProveedorUpdateInput = z.infer<typeof proveedorUpdateSchema>;
