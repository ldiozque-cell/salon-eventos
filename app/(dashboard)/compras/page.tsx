import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ComprasService } from "@/lib/services/compras.service";

const ETIQUETA_ESTADO: Record<string, string> = {
  pendiente: "Pendiente",
  parcial: "Parcial",
  pagado: "Pagado",
  cancelado: "Cancelado",
};

const COLOR_ESTADO: Record<string, string> = {
  pendiente: "badge-warning",
  parcial: "badge-info",
  pagado: "badge-success",
  cancelado: "badge-danger",
};

export default async function ComprasPage({
  searchParams,
}: {
  searchParams: { estado?: string; proveedor?: string; page?: string };
}) {
  const supabase = createClient();
  const service = new ComprasService(supabase);

  const page = Number(searchParams.page ?? "1");
  const { data: compras, count } = await service.listar({
    estadoPago: searchParams.estado as any,
    proveedorId: searchParams.proveedor,
    page,
    pageSize: 25,
  });

  const totalListado = compras?.reduce((acc, c: any) => acc + c.total, 0) ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Compras</h1>
          <p className="text-sm text-slate-500">
            {count} compras registradas · ${totalListado.toFixed(2)} en esta vista
          </p>
        </div>
        <Link href="/compras/nueva" className="btn-primary">
          + Nueva compra
        </Link>
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <select name="estado" defaultValue={searchParams.estado ?? ""} className="select-field w-48">
          <option value="">Todos los estados</option>
          {Object.entries(ETIQUETA_ESTADO).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button className="btn-secondary">Filtrar</button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-sky-200/50 bg-white/90 backdrop-blur-sm shadow-sm">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Proveedor</th>
              <th className="px-4 py-3">Factura</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {compras?.map((c: any) => (
              <tr key={c.id} className="table-row-hover">
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{c.fecha}</td>
                <td className="px-4 py-3 font-medium text-slate-700">{c.proveedores?.nombre}</td>
                <td className="px-4 py-3 text-slate-500">{c.numero_factura ?? "—"}</td>
                <td className="px-4 py-3 font-medium text-slate-700">${c.total.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={COLOR_ESTADO[c.estado_pago]}>
                    {ETIQUETA_ESTADO[c.estado_pago]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/compras/${c.id}`} className="font-medium text-brand-500 hover:text-brand-600">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {compras?.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state">
                  No hay compras con ese filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
