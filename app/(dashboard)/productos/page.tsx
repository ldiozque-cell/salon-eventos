import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductosService } from "@/lib/services/productos.service";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: { q?: string; estado?: "activo" | "inactivo"; stockBajo?: string; page?: string };
}) {
  const supabase = createClient();
  const service = new ProductosService(supabase);

  const page = Number(searchParams.page ?? "1");
  const { data: productos, count } = await service.listar({
    busqueda: searchParams.q,
    estado: searchParams.estado,
    soloStockBajo: searchParams.stockBajo === "1",
    page,
    pageSize: 25,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Productos</h1>
          <p className="text-sm text-slate-500">{count} productos registrados</p>
        </div>
        <Link
          href="/productos/nuevo"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900"
        >
          + Nuevo producto
        </Link>
      </div>

      <form className="mb-4 flex flex-wrap gap-3" method="get">
        <input
          type="search"
          name="q"
          defaultValue={searchParams.q}
          placeholder="Buscar por nombre..."
          className="w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
        />
        <select
          name="estado"
          defaultValue={searchParams.estado ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
        <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
          <input type="checkbox" name="stockBajo" value="1" defaultChecked={searchParams.stockBajo === "1"} />
          Solo stock bajo
        </label>
        <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
          Filtrar
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Stock actual</th>
              <th className="px-4 py-3">Stock mínimo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {productos?.map((p) => {
              const stockBajo = p.stock_actual <= p.stock_minimo;
              return (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.codigo_interno}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.nombre}</td>
                  <td className="px-4 py-3">${p.precio_actual.toFixed(2)}</td>
                  <td className={`px-4 py-3 ${stockBajo ? "font-semibold text-red-600" : ""}`}>
                    {p.stock_actual} {stockBajo && "⚠"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.stock_minimo}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        p.estado === "activo"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                      }`}
                    >
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/productos/${p.id}`} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                      Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
            {productos?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No se encontraron productos con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
