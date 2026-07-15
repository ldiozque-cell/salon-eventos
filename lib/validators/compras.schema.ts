import { z } from "zod";

export const compraItemSchema = z.object({
  producto_id: z.string().uuid("Producto inválido"),
  cantidad: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
  precio_unitario: z.coerce.number().min(0, "El precio no puede ser negativo"),
});

export const compraSchema = z.object({
  fecha: z.string().min(1, "La fecha es obligatoria"), // ISO date string (yyyy-mm-dd)
  numero_factura: z.string().max(50).optional().nullable(),
  proveedor_id: z.string().uuid("Debe seleccionar un proveedor"),
  iva: z.coerce.number().min(0).optional().nullable(),
  forma_pago: z
    .enum(["efectivo", "transferencia", "tarjeta_debito", "tarjeta_credito", "mercado_pago", "otro"])
    .optional()
    .nullable(),
  estado_pago: z.enum(["pendiente", "parcial", "pagado", "cancelado"]).default("pendiente"),
  observaciones: z.string().max(1000).optional().nullable(),
  items: z.array(compraItemSchema).min(1, "La compra debe tener al menos un producto"),
});

export type CompraInput = z.infer<typeof compraSchema>;
export type CompraItemInput = z.infer<typeof compraItemSchema>;
