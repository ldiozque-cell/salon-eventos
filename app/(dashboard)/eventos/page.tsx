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
  pendiente: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  parcial: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  pagado: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  cancelado: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
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
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Eventos</h1>
          <p className="text-sm text-slate-500">{count} eventos registrados</p>
        </div>
        <Link
          href="/eventos/nuevo"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900"
        >
          + Nuevo evento
        </Link>
      </div>

      <form className="mb-4" method="get">
        <select
          name="estado"
          defaultValue={searchParams.estado ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="">Todos los estados de pago</option>
          {Object.entries(ETIQUETA_ESTADO).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-900">
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
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {eventos?.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                  {e.fecha} {e.hora.slice(0, 5)}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{e.cliente_nombre}</td>
                <td className="px-4 py-3 text-slate-500">{e.tematica ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">
                  {e.cantidad_ninos} / {e.cantidad_adultos}
                </td>
                <td className="px-4 py-3">${e.total_cobrado.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${COLOR_ESTADO[e.estado_pago]}`}>
                    {ETIQUETA_ESTADO[e.estado_pago]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/eventos/${e.id}`} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {eventos?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
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
