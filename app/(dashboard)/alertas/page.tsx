import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AlertasService } from "@/lib/services/alertas.service";
import { AlertaCard } from "@/components/dashboard/AlertaCard";

const ETIQUETA_TIPO: Record<string, string> = {
  stock_minimo: "Stock mínimo",
  producto_agotado: "Producto agotado",
  aumento_precio: "Aumento de precio",
  reposicion_sugerida: "Reposición sugerida",
  proveedor_discontinuo: "Proveedor discontinuo",
  producto_vencido: "Producto vencido",
  pago_pendiente: "Pago pendiente",
  evento_saldo_pendiente: "Saldo de evento pendiente",
};

export default async function AlertasPage({
  searchParams,
}: {
  searchParams: { severidad?: string; tipo?: string; incluirResueltas?: string };
}) {
  const supabase = createClient();
  const service = new AlertasService(supabase);

  const { alertas, eventosConSaldoPendiente } = await service.obtenerResumen({
    severidad: searchParams.severidad,
    tipo: searchParams.tipo,
    soloNoResueltas: searchParams.incluirResueltas !== "1",
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Alertas</h1>
        <p className="text-sm text-slate-500">
          {alertas?.length ?? 0} alertas activas · {eventosConSaldoPendiente?.length ?? 0} eventos con saldo pendiente próximos
        </p>
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <select
          name="severidad"
          defaultValue={searchParams.severidad ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="">Todas las severidades</option>
          <option value="critica">Crítica</option>
          <option value="advertencia">Advertencia</option>
          <option value="info">Info</option>
        </select>
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
        <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
          <input type="checkbox" name="incluirResueltas" value="1" defaultChecked={searchParams.incluirResueltas === "1"} />
          Incluir resueltas
        </label>
        <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
          Filtrar
        </button>
      </form>

      {/* Eventos con saldo pendiente próximos: calculado en vivo, no persistido */}
      {eventosConSaldoPendiente && eventosConSaldoPendiente.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
          <h2 className="mb-3 text-sm font-semibold text-amber-800 dark:text-amber-400">
            ⚠ Eventos con saldo pendiente (próximos 7 días o vencidos)
          </h2>
          <ul className="divide-y divide-amber-200 dark:divide-amber-900/50">
            {eventosConSaldoPendiente.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2 text-sm">
                <Link href={`/eventos/${e.id}`} className="font-medium text-slate-900 hover:underline dark:text-white">
                  {e.cliente_nombre}
                </Link>
                <span className="text-slate-600 dark:text-slate-300">
                  {e.fecha} · ${e.total_cobrado.toFixed(2)} ({e.estado_pago})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Alertas persistidas (generadas automáticamente por triggers en la DB) */}
      <div className="space-y-3">
        {alertas?.map((a) => (
          <AlertaCard key={a.id} alerta={a} />
        ))}
        {(!alertas || alertas.length === 0) && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900">
            No hay alertas activas. Todo en orden. 👍
          </div>
        )}
      </div>
    </div>
  );
}
