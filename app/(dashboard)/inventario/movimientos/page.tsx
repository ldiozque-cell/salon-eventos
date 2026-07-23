import { createClient } from "@/lib/supabase/server";
import { InventarioService } from "@/lib/services/inventario.service";
import { AjusteInventarioForm } from "@/components/forms/AjusteInventarioForm";

const ETIQUETA_TIPO: Record<string, string> = {
  entrada_compra: "Entrada por compra",
  salida_evento: "Salida por evento",
  ajuste_positivo: "Ajuste (+)",
  ajuste_negativo: "Ajuste (−)",
  perdida: "Pérdida",
  rotura: "Rotura",
  vencimiento: "Vencimiento",
};

const COLOR_TIPO: Record<string, string> = {
  entrada_compra: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  salida_evento: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  ajuste_positivo: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  ajuste_negativo: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  perdida: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  rotura: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  vencimiento: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export default async function MovimientosInventarioPage({
  searchParams,
}: {
  searchParams: { tipo?: string; page?: string };
}) {
  const supabase = createClient();
  const service = new InventarioService(supabase);

  const page = Number(searchParams.page ?? "1");
  const [{ data: movimientos, count }, { data: productos }] = await Promise.all([
    service.listarMovimientos({ tipo: searchParams.tipo, page, pageSize: 30 }),
    supabase.from("productos").select("id, nombre, stock_actual").eq("estado", "activo").order("nombre"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Movimientos de inventario</h1>
          <p className="text-sm text-slate-900">{count} movimientos registrados</p>
        </div>
      </div>

      <AjusteInventarioForm productos={productos ?? []} />

      <form className="flex flex-wrap gap-3" method="get">
        <select
          name="tipo"
          defaultValue={searchParams.tipo ?? ""}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
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
          <thead className="bg-slate-50 text-left text-slate-900 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Cantidad</th>
              <th className="px-4 py-3">Stock resultante</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {movimientos?.map((m: any) => (
              <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                <td className="px-4 py-3 whitespace-nowrap text-slate-900">
                  {new Date(m.created_at).toLocaleString("es-AR")}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{m.productos?.nombre}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${COLOR_TIPO[m.tipo] ?? ""}`}>
                    {ETIQUETA_TIPO[m.tipo] ?? m.tipo}
                  </span>
                </td>
                <td className={`px-4 py-3 font-medium ${m.cantidad >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {m.cantidad >= 0 ? "+" : ""}
                  {m.cantidad}
                </td>
                <td className="px-4 py-3 text-slate-900">{m.stock_resultante}</td>
                <td className="px-4 py-3 text-slate-900">{m.perfiles?.nombre_completo ?? "—"}</td>
                <td className="px-4 py-3 text-slate-900">{m.motivo ?? "—"}</td>
              </tr>
            ))}
            {movimientos?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-900">
                  No hay movimientos con ese filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
