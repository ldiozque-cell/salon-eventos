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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Productos</h1>
          <p className="text-sm text-slate-500">{count} productos registrados</p>
        </div>
        <Link href="/productos/nuevo" className="btn-primary">
          + Nuevo producto
        </Link>
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <input
          type="search"
          name="q"
          defaultValue={searchParams.q}
          placeholder="Buscar por nombre..."
          className="input-field w-64"
        />
        <select name="estado" defaultValue={searchParams.estado ?? ""} className="select-field w-48">
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
        <label className="flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-600">
          <input type="checkbox" name="stockBajo" value="1" defaultChecked={searchParams.stockBajo === "1"} className="rounded border-sky-300 text-brand-500 focus:ring-brand-400" />
          Solo stock bajo
        </label>
        <button className="btn-secondary">Filtrar</button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-sky-200/50 bg-white/90 backdrop-blur-sm shadow-sm">
        <table className="w-full text-sm">
          <thead className="table-header">
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
          <tbody className="divide-y divide-slate-100">
            {productos?.map((p) => {
              const stockBajo = p.stock_actual <= p.stock_minimo;
              return (
                <tr key={p.id} className="table-row-hover">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.codigo_interno}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{p.nombre}</td>
                  <td className="px-4 py-3 text-slate-600">${p.precio_actual.toFixed(2)}</td>
                  <td className={`px-4 py-3 font-medium ${stockBajo ? "text-red-500" : "text-green-600"}`}>
                    {p.stock_actual} {stockBajo && "⚠"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.stock_minimo}</td>
                  <td className="px-4 py-3">
                    {p.estado === "activo" ? (
                      <span className="badge-success">activo</span>
                    ) : (
                      <span className="badge bg-slate-100 text-slate-600">inactivo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/productos/${p.id}`} className="font-medium text-brand-500 hover:text-brand-600">
                      Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
            {productos?.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-state">
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
