import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ComprasService } from "@/lib/services/compras.service";
import { EstadoPagoCompraSelect } from "@/components/forms/EstadoPagoCompraSelect";

export default async function DetalleCompraPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const service = new ComprasService(supabase);
  const compra = await service.obtener(params.id).catch(() => null);

  if (!compra) notFound();

  const c = compra as any;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Compra a {c.proveedores?.nombre}
          </h1>
          <p className="text-sm text-slate-500">
            {c.fecha} {c.numero_factura ? `· Factura ${c.numero_factura}` : ""}
          </p>
        </div>
        <Link href={`/proveedores/${c.proveedor_id}`} className="text-sm text-slate-500 hover:underline">
          Ver proveedor →
        </Link>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-xs text-slate-500">Estado de pago</p>
          <div className="mt-1">
            <EstadoPagoCompraSelect compraId={c.id} estadoActual={c.estado_pago} />
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">${c.total.toFixed(2)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Productos comprados</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="pb-2">Producto</th>
              <th className="pb-2">Cantidad</th>
              <th className="pb-2">Precio unit.</th>
              <th className="pb-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {c.compra_items?.map((item: any) => (
              <tr key={item.id}>
                <td className="py-2 font-medium text-slate-900 dark:text-white">
                  <Link href={`/productos/${item.producto_id}`} className="hover:underline">
                    {item.productos?.nombre}
                  </Link>
                </td>
                <td className="py-2 text-slate-500">{item.cantidad}</td>
                <td className="py-2 text-slate-500">${item.precio_unitario.toFixed(2)}</td>
                <td className="py-2 text-right font-medium">${item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 space-y-1 border-t border-slate-200 pt-4 text-right text-sm dark:border-slate-800">
          <p className="text-slate-500">Subtotal: ${c.subtotal.toFixed(2)}</p>
          {c.iva > 0 && <p className="text-slate-500">IVA: ${c.iva.toFixed(2)}</p>}
          <p className="text-base font-semibold text-slate-900 dark:text-white">Total: ${c.total.toFixed(2)}</p>
        </div>
      </div>

      {c.observaciones && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <p className="mb-1 text-xs font-semibold text-slate-500">Observaciones</p>
          {c.observaciones}
        </div>
      )}
    </div>
  );
}
