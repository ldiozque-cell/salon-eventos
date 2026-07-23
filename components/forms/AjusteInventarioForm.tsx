"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registrarAjusteInventarioAction } from "@/app/(dashboard)/inventario/movimientos/actions";

interface Producto {
  id: string;
  nombre: string;
  stock_actual: number;
}

const TIPOS_AJUSTE = [
  { value: "ajuste_positivo", label: "Ajuste positivo (suma stock)" },
  { value: "ajuste_negativo", label: "Ajuste negativo (resta stock)" },
  { value: "perdida", label: "Pérdida" },
  { value: "rotura", label: "Rotura" },
  { value: "vencimiento", label: "Vencimiento" },
];

export function AjusteInventarioForm({ productos }: { productos: Producto[] }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const resultado = await registrarAjusteInventarioAction(formData);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setAbierto(false);
      router.refresh();
    });
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900"
      >
        + Registrar ajuste
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nuevo ajuste manual</h2>
        <button onClick={() => setAbierto(false)} className="text-slate-400 hover:text-slate-700">
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Producto</label>
          <select
            name="producto_id"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          >
            <option value="">Seleccionar...</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} (stock: {p.stock_actual})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de ajuste</label>
          <select
            name="tipo"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          >
            {TIPOS_AJUSTE.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Cantidad</label>
          <input
            type="number"
            name="cantidad"
            min="0.01"
            step="0.01"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Motivo</label>
          <input
            type="text"
            name="motivo"
            required
            placeholder="Ej: rotura durante traslado"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-slate-900"
          >
            {isPending ? "Guardando..." : "Registrar ajuste"}
          </button>
        </div>
      </form>
    </div>
  );
}
