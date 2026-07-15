import { createClient } from "@/lib/supabase/server";
import { IngresosService } from "@/lib/services/ingresos.service";
import { IngresoForm } from "@/components/forms/IngresoForm";

const ETIQUETA_TIPO: Record<string, string> = {
  reserva: "Reserva",
  sena: "Seña",
  pago_final: "Pago final",
  extra: "Extra",
  cancelacion: "Cancelación",
  reembolso: "Reembolso",
};

export default async function IngresosPage({
  searchParams,
}: {
  searchParams: { tipo?: string; evento?: string; page?: string };
}) {
  const supabase = createClient();
  const service = new IngresosService(supabase);

  const page = Number(searchParams.page ?? "1");
  const [{ data: ingresos, count }, { data: eventos }] = await Promise.all([
    service.listar({ tipo: searchParams.tipo, eventoId: searchParams.evento, page, pageSize: 30 }),
    supabase
      .from("eventos")
      .select("id, cliente_nombre, fecha")
      .order("fecha", { ascending: false })
      .limit(100),
  ]);

  const totalListado = ingresos?.reduce((acc, i) => acc + i.importe, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Ingresos</h1>
          <p className="text-sm text-slate-500">
            {count} registros · ${totalListado.toFixed(2)} en esta vista
          </p>
        </div>
      </div>

      <IngresoForm eventos={eventos ?? []} eventoPreseleccionado={searchParams.evento} />

      <form className="flex flex-wrap gap-3" method="get">
        <select
          name="tipo"
          defaultValue={searchParams.tipo ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="">Todos los tipos</option>
          {Object.entries(ETIQUETA_TIPO).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
          Filtrar
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {ingresos?.map((i: any) => (
              <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">{i.fecha}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {ETIQUETA_TIPO[i.tipo] ?? i.tipo}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{i.eventos?.cliente_nombre ?? "—"}</td>
                <td className={`px-4 py-3 font-medium ${i.importe >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${i.importe.toFixed(2)}
                </td>
              </tr>
            ))}
            {ingresos?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No hay ingresos con ese filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
