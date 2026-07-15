import { createClient } from "@/lib/supabase/server";
import { GastosService } from "@/lib/services/gastos.service";
import { GastoForm } from "@/components/forms/GastoForm";

const ETIQUETA_CATEGORIA: Record<string, string> = {
  alimentos: "Alimentos",
  bebidas: "Bebidas",
  limpieza: "Limpieza",
  decoracion: "Decoración",
  personal: "Personal",
  servicios: "Servicios",
  publicidad: "Publicidad",
  reparaciones: "Reparaciones",
  impuestos: "Impuestos",
  otros: "Otros",
};

export default async function GastosPage({
  searchParams,
}: {
  searchParams: { categoria?: string; page?: string };
}) {
  const supabase = createClient();
  const service = new GastosService(supabase);

  const page = Number(searchParams.page ?? "1");
  const [{ data: gastos, count }, { data: proveedores }] = await Promise.all([
    service.listar({ categoria: searchParams.categoria, page, pageSize: 30 }),
    supabase.from("proveedores").select("id, nombre").eq("activo", true).order("nombre"),
  ]);

  const gastosList = (gastos ?? []) as Array<any>;
  const totalListado = gastosList.reduce((acc, g) => acc + (Number(g.importe) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Gastos</h1>
          <p className="text-sm text-slate-500">
            {count} registros · ${totalListado.toFixed(2)} en esta vista
          </p>
        </div>
      </div>

      <GastoForm proveedores={proveedores ?? []} />

      <form className="flex flex-wrap gap-3" method="get">
        <select
          name="categoria"
          defaultValue={searchParams.categoria ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="">Todas las categorías</option>
          {Object.entries(ETIQUETA_CATEGORIA).map(([value, label]) => (
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
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Concepto</th>
              <th className="px-4 py-3">Proveedor</th>
              <th className="px-4 py-3">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {gastos?.map((g: any) => (
              <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">{g.fecha}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {ETIQUETA_CATEGORIA[g.categoria] ?? g.categoria}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{g.concepto}</td>
                <td className="px-4 py-3 text-slate-500">{g.proveedores?.nombre ?? "—"}</td>
                <td className="px-4 py-3 font-medium text-red-600">${g.importe.toFixed(2)}</td>
              </tr>
            ))}
            {gastos?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No hay gastos con ese filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
