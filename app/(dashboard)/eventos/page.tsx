import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EventosService } from "@/lib/services/eventos.service";

const ETIQUETA_ESTADO: Record<string, string> = {
  pendiente: "Pendiente",
  parcial: "Seña pagada",
  pagado: "Pagado",
  cancelado: "Cancelado",
};

const COLOR_ESTADO: Record<string, string> = {
  pendiente: "badge-warning",
  parcial: "badge-info",
  pagado: "badge-success",
  cancelado: "badge-danger",
};

export default async function EventosPage({
  searchParams,
}: {
  searchParams: { estado?: string; page?: string };
}) {
  const supabase = createClient();
  const service = new EventosService(supabase);

  const page = Number(searchParams.page ?? "1");
  const resultado = await service.listar({
    estadoPago: searchParams.estado as any,
    page,
    pageSize: 25,
  });
  const eventos = (resultado?.data ?? []) as Array<any>;
  const count = resultado?.count ?? 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title">Eventos</h1>
          <p className="page-subtitle">{count} eventos registrados</p>
        </div>
        <Link
          href="/eventos/nuevo"
          className="btn-primary"
        >
          + Nuevo evento
        </Link>
      </div>

      <form className="mb-4" method="get">
        <select
          name="estado"
          defaultValue={searchParams.estado ?? ""}
          className="select-field"
        >
          <option value="">Todos los estados de pago</option>
          {Object.entries(ETIQUETA_ESTADO).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Temática</th>
              <th className="px-4 py-3">Niños / Adultos</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {eventos?.map((e) => (
              <tr key={e.id} className="table-row-hover">
                <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                  {e.fecha} {e.hora.slice(0, 5)}
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">{e.cliente_nombre}</td>
                <td className="px-4 py-3 text-slate-700">{e.tematica ?? "—"}</td>
                <td className="px-4 py-3 text-slate-700">
                  {e.cantidad_ninos} / {e.cantidad_adultos}
                </td>
                <td className="px-4 py-3">${e.total_cobrado.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={COLOR_ESTADO[e.estado_pago]}>
                    {ETIQUETA_ESTADO[e.estado_pago]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/eventos/${e.id}`} className="text-brand-500 hover:text-brand-600 font-medium">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {eventos?.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-state">
                  No hay eventos con ese filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
