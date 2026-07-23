"use client";

import { useState } from "react";

interface TipoReporteOpcion {
  value: string;
  label: string;
  usaFechas: boolean;
  soloAdmin: boolean;
}

const TIPOS: TipoReporteOpcion[] = [
  { value: "inventario", label: "Inventario", usaFechas: false, soloAdmin: false },
  { value: "compras", label: "Compras", usaFechas: true, soloAdmin: false },
  { value: "proveedores", label: "Proveedores", usaFechas: false, soloAdmin: false },
  { value: "eventos", label: "Eventos", usaFechas: true, soloAdmin: false },
  { value: "ingresos", label: "Ingresos", usaFechas: true, soloAdmin: true },
  { value: "gastos", label: "Gastos", usaFechas: true, soloAdmin: true },
  { value: "balance", label: "Balance (12 meses)", usaFechas: false, soloAdmin: true },
  { value: "productos-mas-utilizados", label: "Productos más utilizados", usaFechas: false, soloAdmin: false },
  { value: "productos-menos-utilizados", label: "Productos menos utilizados", usaFechas: false, soloAdmin: false },
  { value: "rentabilidad", label: "Rentabilidad por evento", usaFechas: true, soloAdmin: true },
  { value: "estadisticas", label: "Estadísticas — pronóstico de reposición", usaFechas: false, soloAdmin: false },
];

export function ReporteForm({ esAdmin }: { esAdmin: boolean }) {
  const [tipo, setTipo] = useState("inventario");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const opcion = TIPOS.find((t) => t.value === tipo)!;
  const opcionesVisibles = TIPOS.filter((t) => !t.soloAdmin || esAdmin);

  function construirUrl(formato: "pdf" | "excel") {
    const params = new URLSearchParams({ formato });
    if (opcion.usaFechas && desde) params.set("desde", desde);
    if (opcion.usaFechas && hasta) params.set("hasta", hasta);
    return `/api/reportes/${tipo}?${params.toString()}`;
  }

  return (
    <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de reporte</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          >
            {opcionesVisibles.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {opcion.usaFechas && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Desde</label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Hasta</label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
              />
            </div>
          </div>
        )}
        {!opcion.usaFechas && (
          <p className="text-xs text-slate-400">Este reporte muestra el estado actual, no se filtra por fechas.</p>
        )}

        <div className="flex gap-3 pt-2">
          <a
            href={construirUrl("pdf")}
            className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900"
          >
            Descargar PDF
          </a>
          <a
            href={construirUrl("excel")}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Descargar Excel
          </a>
        </div>
      </div>
    </div>
  );
}
