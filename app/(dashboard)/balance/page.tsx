import { createClient } from "@/lib/supabase/server";
import { BalanceService } from "@/lib/services/balance.service";
import { EvolucionMensualChart } from "@/components/charts/EvolucionMensualChart";

const formatoMoneda = (n: number) => `$${n.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

function VariacionBadge({ pct }: { pct: number }) {
  const positiva = pct >= 0;
  return (
    <span className={`text-xs font-medium ${positiva ? "text-green-600" : "text-red-600"}`}>
      {positiva ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}% vs. mes anterior
    </span>
  );
}

export default async function BalancePage() {
  const supabase = createClient();
  const service = new BalanceService(supabase);
  const { evolucionMensual, comparacionMensual, balanceAnual } = await service.obtenerResumenCompleto();

  const c = comparacionMensual;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Balance</h1>
        <p className="text-sm text-slate-500">Comparación mensual y anual de ingresos, gastos y rentabilidad</p>
      </div>

      {/* Comparación mes actual vs anterior */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Ingresos del mes</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">{formatoMoneda(c?.ingresos_actual ?? 0)}</p>
          {c && <VariacionBadge pct={c.variacion_ingresos_pct} />}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Gastos del mes</p>
          <p className="mt-1 text-2xl font-semibold text-red-600">{formatoMoneda(c?.gastos_actual ?? 0)}</p>
          {c && <VariacionBadge pct={c.variacion_gastos_pct} />}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Ganancia neta del mes</p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              (c?.ganancia_actual ?? 0) >= 0 ? "text-slate-900 dark:text-white" : "text-red-600"
            }`}
          >
            {formatoMoneda(c?.ganancia_actual ?? 0)}
          </p>
          {c && <VariacionBadge pct={c.variacion_ganancia_pct} />}
        </div>
      </div>

      {/* Evolución mensual (12 meses) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Evolución mensual (últimos 12 meses)
        </h2>
        <EvolucionMensualChart datos={evolucionMensual ?? []} />
      </div>

      {/* Comparación anual */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Comparación anual</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2 pr-4">Año</th>
                <th className="py-2 pr-4">Ingresos</th>
                <th className="py-2 pr-4">Gastos</th>
                <th className="py-2 pr-4">Ganancia</th>
                <th className="py-2">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {balanceAnual
                ?.filter((b) => b.ingresos > 0 || b.gastos > 0)
                .map((b) => (
                  <tr key={b.anio}>
                    <td className="py-2 pr-4 font-medium text-slate-900 dark:text-white">{b.anio}</td>
                    <td className="py-2 pr-4 text-green-600">{formatoMoneda(b.ingresos)}</td>
                    <td className="py-2 pr-4 text-red-600">{formatoMoneda(b.gastos)}</td>
                    <td className={`py-2 pr-4 font-medium ${b.ganancia >= 0 ? "" : "text-red-600"}`}>
                      {formatoMoneda(b.ganancia)}
                    </td>
                    <td className="py-2 text-slate-500">{b.margen_porcentual.toFixed(1)}%</td>
                  </tr>
                ))}
              {(!balanceAnual || balanceAnual.filter((b) => b.ingresos > 0 || b.gastos > 0).length === 0) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Todavía no hay suficiente historial para comparar años.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
