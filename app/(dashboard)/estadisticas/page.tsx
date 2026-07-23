import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EstadisticasService } from "@/lib/services/estadisticas.service";
import { KpiCard } from "@/components/dashboard/KpiCard";

const formatoMoneda = (n: number) => `$${n.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

export default async function EstadisticasPage() {
  const supabase = createClient();
  const service = new EstadisticasService(supabase);

  const {
    valorInventario,
    productosMayorAumento,
    productosMenosUtilizados,
    productosSinMovimiento,
    capitalInmovilizado,
    pronosticoReposicion,
    proyeccionGastos,
    proyeccionCompras,
    costoPromedioEventoNum,
    cantidadEventosConsiderados,
  } = await service.obtenerResumenCompleto();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Estadísticas inteligentes</h1>
        <p className="text-sm text-slate-900">
          Cálculos automáticos sobre consumo, precios, proveedores y proyecciones
        </p>
      </div>

      {/* KPIs de valorización e inventario */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Valor total del inventario" valor={formatoMoneda(valorInventario?.valor_total_inventario ?? 0)} />
        <KpiCard
          label={`Costo promedio por evento (últ. ${cantidadEventosConsiderados})`}
          valor={formatoMoneda(costoPromedioEventoNum)}
        />
        <KpiCard label="Proyección de gastos — próximo mes" valor={formatoMoneda(proyeccionGastos?.proyeccion_proximo_mes ?? 0)} />
        <KpiCard
          label="Proyección de compras — reposición inmediata"
          valor={formatoMoneda(proyeccionCompras?.valor_reposicion_inmediata ?? 0)}
          tono={(proyeccionCompras?.valor_reposicion_inmediata ?? 0) > 0 ? "advertencia" : "neutral"}
        />
      </div>

      <p className="-mt-4 text-xs text-slate-900">
        Promedio histórico de compras mensuales (referencia): {formatoMoneda(proyeccionCompras?.promedio_compras_mensual ?? 0)}
      </p>

      {/* Pronóstico de reposición */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Pronóstico de reposición</h2>
        <p className="mb-4 text-xs text-slate-900">
          Basado en cada cuánto se compró históricamente cada producto (mínimo 2 compras registradas)
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-900">
              <tr>
                <th className="pb-2">Producto</th>
                <th className="pb-2">Frecuencia promedio</th>
                <th className="pb-2">Última compra</th>
                <th className="pb-2">Próxima compra estimada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pronosticoReposicion?.map((p) => {
                const vencida = new Date(p.proxima_compra_estimada) < new Date();
                return (
                  <tr key={p.producto_id}>
                    <td className="py-2">
                      <Link href={`/productos/${p.producto_id}`} className="font-medium text-slate-900 hover:underline dark:text-white">
                        {p.nombre}
                      </Link>
                    </td>
                    <td className="py-2 text-slate-900">cada {p.promedio_dias_entre_compras} días</td>
                    <td className="py-2 text-slate-900">{p.ultima_compra}</td>
                    <td className={`py-2 font-medium ${vencida ? "text-amber-600" : "text-slate-700 dark:text-slate-300"}`}>
                      {p.proxima_compra_estimada} {vencida && "· ya debería reponerse"}
                    </td>
                  </tr>
                );
              })}
              {(!pronosticoReposicion || pronosticoReposicion.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-900">
                    Todavía no hay suficiente historial de compras para proyectar (se necesitan al menos 2 compras por producto).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Productos que más aumentaron */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Productos que más aumentaron</h2>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {productosMayorAumento?.map((p) => (
              <li key={p.producto_id} className="flex items-center justify-between py-2 text-sm">
                <span className="font-medium text-slate-900 dark:text-white">{p.nombre}</span>
                <span className="text-red-600">+{p.variacion_porcentual}%</span>
              </li>
            ))}
            {(!productosMayorAumento || productosMayorAumento.length === 0) && (
              <li className="py-4 text-center text-sm text-slate-900">Sin aumentos de precio registrados.</li>
            )}
          </ul>
        </div>

        {/* Productos con menos uso */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Productos que menos se utilizan</h2>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {productosMenosUtilizados?.map((p) => (
              <li key={p.producto_id} className="flex items-center justify-between py-2 text-sm">
                <span className="font-medium text-slate-900 dark:text-white">{p.nombre}</span>
                <span className="text-slate-900">{p.cantidad_total_consumida} unid. consumidas (histórico)</span>
              </li>
            ))}
            {(!productosMenosUtilizados || productosMenosUtilizados.length === 0) && (
              <li className="py-4 text-center text-sm text-slate-900">Sin datos de consumo todavía.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Productos sin movimiento */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Productos sin ningún movimiento</h2>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {productosSinMovimiento?.map((p) => (
              <li key={p.producto_id} className="flex items-center justify-between py-2 text-sm">
                <Link href={`/productos/${p.producto_id}`} className="font-medium text-slate-900 hover:underline dark:text-white">
                  {p.nombre}
                </Link>
                <span className="text-slate-900">stock: {p.stock_actual}</span>
              </li>
            ))}
            {(!productosSinMovimiento || productosSinMovimiento.length === 0) && (
              <li className="py-4 text-center text-sm text-slate-900">Todos los productos tuvieron movimiento. 👍</li>
            )}
          </ul>
        </div>

        {/* Capital inmovilizado */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Capital inmovilizado</h2>
          <p className="mb-4 text-xs text-slate-900">Stock sin consumo hace más de 90 días</p>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {capitalInmovilizado?.map((p) => (
              <li key={p.producto_id} className="flex items-center justify-between py-2 text-sm">
                <Link href={`/productos/${p.producto_id}`} className="font-medium text-slate-900 hover:underline dark:text-white">
                  {p.nombre}
                </Link>
                <span className="text-slate-900">{formatoMoneda(p.valor_inmovilizado)}</span>
              </li>
            ))}
            {(!capitalInmovilizado || capitalInmovilizado.length === 0) && (
              <li className="py-4 text-center text-sm text-slate-900">Sin capital inmovilizado relevante. 👍</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
