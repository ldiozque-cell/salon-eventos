import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DashboardService } from "@/lib/services/dashboard.service";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { EvolucionMensualChart } from "@/components/charts/EvolucionMensualChart";
import { GastosPorCategoriaChart } from "@/components/charts/GastosPorCategoriaChart";

const formatoMoneda = (n: number) => `$${n.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

const ETIQUETA_MOVIMIENTO: Record<string, string> = {
  entrada_compra: "Entrada por compra",
  salida_evento: "Salida por evento",
  ajuste_positivo: "Ajuste (+)",
  ajuste_negativo: "Ajuste (−)",
  perdida: "Pérdida",
  rotura: "Rotura",
  vencimiento: "Vencimiento",
};

export default async function DashboardPage() {
  const supabase = createClient();

  // Perfil solo para saber el rol y decidir qué KPIs financieros mostrar
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user!.id).single();
  const esAdmin = perfil?.rol === "admin";

  const service = new DashboardService(supabase);
  const resumen = await service.obtenerResumenCompleto();

  const {
    indicadoresMes,
    evolucionMensual,
    gastosPorCategoria,
    productosMasUtilizados,
    proveedoresMayorVolumen,
    comprasSugeridas,
    valorInventario,
    ultimosMovimientos,
    comprasRecientes,
  } = resumen;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500">Resumen del mes en curso</p>
      </div>

      {/* KPIs principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Eventos del mes" valor={String(indicadoresMes?.eventos_mes ?? 0)} />
        {esAdmin ? (
          <>
            <KpiCard label="Ingresos del mes" valor={formatoMoneda(indicadoresMes?.ingresos_mes ?? 0)} tono="positivo" />
            <KpiCard label="Gastos del mes" valor={formatoMoneda(indicadoresMes?.gastos_mes ?? 0)} tono="negativo" />
            <KpiCard
              label="Ganancia neta"
              valor={formatoMoneda(indicadoresMes?.ganancia_neta_mes ?? 0)}
              tono={(indicadoresMes?.ganancia_neta_mes ?? 0) >= 0 ? "positivo" : "negativo"}
            />
          </>
        ) : (
          <KpiCard label="Valor del inventario" valor={formatoMoneda(valorInventario?.valor_total_inventario ?? 0)} />
        )}
        <KpiCard
          label="Productos con stock bajo"
          valor={String(valorInventario?.productos_stock_bajo ?? 0)}
          tono={(valorInventario?.productos_stock_bajo ?? 0) > 0 ? "advertencia" : "neutral"}
        />
        <KpiCard
          label="Productos agotados"
          valor={String(valorInventario?.productos_agotados ?? 0)}
          tono={(valorInventario?.productos_agotados ?? 0) > 0 ? "negativo" : "neutral"}
        />
      </div>

      {/* Gráficos: solo visibles para admin, que es quien ve rentabilidad */}
      {esAdmin && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Evolución mensual (últimos 12 meses)
            </h2>
            <EvolucionMensualChart datos={evolucionMensual ?? []} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Gastos por categoría (este mes)
            </h2>
            <GastosPorCategoriaChart datos={gastosPorCategoria ?? []} />
          </div>
        </div>
      )}

      {/* Compras sugeridas */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Próximas compras sugeridas</h2>
          <Link href="/compras/nueva" className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
            Registrar compra →
          </Link>
        </div>
        {comprasSugeridas && comprasSugeridas.length > 0 ? (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {comprasSugeridas.map((p) => (
              <li key={p.producto_id} className="flex items-center justify-between py-2 text-sm">
                <span className="font-medium text-slate-900 dark:text-white">{p.nombre}</span>
                <span className="text-slate-500">
                  Stock: {p.stock_actual} / mín. {p.stock_minimo} · sugerido:{" "}
                  <span className="font-semibold text-amber-600">{p.cantidad_sugerida}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">No hay productos por debajo del stock mínimo. 👍</p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Últimos movimientos */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Últimos movimientos</h2>
            <Link href="/inventario/movimientos" className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
              Ver todos →
            </Link>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {ultimosMovimientos?.map((m: any) => (
              <li key={m.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <span className="font-medium text-slate-900 dark:text-white">{m.productos?.nombre}</span>
                  <span className="ml-2 text-xs text-slate-400">{ETIQUETA_MOVIMIENTO[m.tipo] ?? m.tipo}</span>
                </div>
                <span className={m.cantidad >= 0 ? "text-green-600" : "text-red-600"}>
                  {m.cantidad >= 0 ? "+" : ""}
                  {m.cantidad}
                </span>
              </li>
            ))}
            {(!ultimosMovimientos || ultimosMovimientos.length === 0) && (
              <li className="py-4 text-center text-sm text-slate-400">Sin movimientos todavía.</li>
            )}
          </ul>
        </div>

        {/* Compras recientes */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Compras recientes</h2>
            <Link href="/compras" className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
              Ver todas →
            </Link>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {comprasRecientes?.map((c: any) => (
              <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <span className="font-medium text-slate-900 dark:text-white">{c.proveedores?.nombre}</span>
                  <span className="ml-2 text-xs text-slate-400">{c.fecha}</span>
                </div>
                <span className="text-slate-600 dark:text-slate-300">{formatoMoneda(c.total)}</span>
              </li>
            ))}
            {(!comprasRecientes || comprasRecientes.length === 0) && (
              <li className="py-4 text-center text-sm text-slate-400">Sin compras todavía.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Productos más utilizados */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Productos más utilizados</h2>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {productosMasUtilizados?.map((p) => (
              <li key={p.producto_id} className="flex items-center justify-between py-2 text-sm">
                <span className="font-medium text-slate-900 dark:text-white">{p.nombre}</span>
                <span className="text-slate-500">
                  {p.cantidad_total_consumida} unid. · {p.cantidad_eventos} eventos
                </span>
              </li>
            ))}
            {(!productosMasUtilizados || productosMasUtilizados.length === 0) && (
              <li className="py-4 text-center text-sm text-slate-400">Todavía no hay consumo registrado.</li>
            )}
          </ul>
        </div>

        {/* Proveedores con mayor volumen */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Proveedores con mayor volumen de compra
          </h2>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {proveedoresMayorVolumen?.map((p) => (
              <li key={p.proveedor_id} className="flex items-center justify-between py-2 text-sm">
                <span className="font-medium text-slate-900 dark:text-white">{p.nombre}</span>
                <span className="text-slate-500">
                  {formatoMoneda(p.total_comprado)} · {p.cantidad_compras} compras
                </span>
              </li>
            ))}
            {(!proveedoresMayorVolumen || proveedoresMayorVolumen.length === 0) && (
              <li className="py-4 text-center text-sm text-slate-400">Todavía no hay compras registradas.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
