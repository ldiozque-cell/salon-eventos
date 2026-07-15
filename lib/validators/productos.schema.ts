import { z } from "zod";

export const productoSchema = z.object({
  codigo_interno: z
    .string()
    .min(1, "El código interno es obligatorio")
    .max(50),
  codigo_barras: z.string().max(50).optional().nullable(),
  nombre: z.string().min(2, "El nombre es obligatorio").max(200),
  categoria_id: z.string().uuid().optional().nullable(),
  subcategoria_id: z.string().uuid().optional().nullable(),
  marca: z.string().max(100).optional().nullable(),
  unidad_medida: z.string().min(1).default("unidad"),
  presentacion: z.string().max(100).optional().nullable(),
  proveedor_principal_id: z.string().uuid().optional().nullable(),
  precio_actual: z.coerce.number().min(0, "El precio no puede ser negativo"),
  stock_actual: z.coerce.number().min(0).default(0),
  stock_minimo: z.coerce.number().min(0).default(0),
  stock_ideal: z.coerce.number().min(0).default(0),
  ubicacion_fisica: z.string().max(200).optional().nullable(),
  imagen_url: z.string().url().optional().nullable(),
  estado: z.enum(["activo", "inactivo"]).default("activo"),
}).refine((data) => data.stock_ideal >= data.stock_minimo, {
  message: "El stock ideal no puede ser menor al stock mínimo",
  path: ["stock_ideal"],
});

export type ProductoInput = z.infer<typeof productoSchema>;

// Para actualización: todos los campos opcionales, pero igual validados si vienen
export const productoUpdateSchema = productoSchema.innerType().partial();
export type ProductoUpdateInput = z.infer<typeof productoUpdateSchema>;
