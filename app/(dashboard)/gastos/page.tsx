import { createClient } from "@/lib/supabase/server";
import { GastosService } from "@/lib/services/gastos.service";
import { GastoForm } from "@/components/forms/GastoForm";
import { GastosAcciones } from "./GastosAcciones";

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
          <h1 className="page-title">Gastos</h1>
          <p className="page-subtitle">
            {count} registros · ${totalListado.toFixed(2)} en esta vista
          </p>
        </div>
      </div>

      <GastoForm proveedores={proveedores ?? []} />

      <form className="flex flex-wrap gap-3" method="get">
        <select
          name="categoria"
          defaultValue={searchParams.categoria ?? ""}
          className="select-field"
        >
          <option value="">Todas las categorías</option>
          {Object.entries(ETIQUETA_CATEGORIA).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
          Filtrar
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Concepto</th>
              <th className="px-4 py-3">Proveedor</th>
              <th className="px-4 py-3">Importe</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {gastos?.map((g: any) => (
              <tr key={g.id} className="table-row-hover">
                <td className="px-4 py-3 whitespace-nowrap text-slate-700">{g.fecha}</td>
                <td className="px-4 py-3">
                  <span className="badge-info">
                    {ETIQUETA_CATEGORIA[g.categoria] ?? g.categoria}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-700">{g.concepto}</td>
                <td className="px-4 py-3 text-slate-700">{g.proveedores?.nombre ?? "—"}</td>
                <td className="px-4 py-3 font-medium text-red-600">${g.importe.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <GastosAcciones
                    gastoId={g.id}
                    gasto={{
                      fecha: g.fecha,
                      categoria: g.categoria,
                      concepto: g.concepto,
                      proveedor_id: g.proveedor_id,
                      importe: g.importe,
                      medio_pago: g.medio_pago,
                      observaciones: g.observaciones,
                    }}
                    proveedores={proveedores ?? []}
                  />
                </td>
              </tr>
            ))}
            {gastos?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
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
