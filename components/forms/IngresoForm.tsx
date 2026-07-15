"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearIngresoAction } from "@/app/(dashboard)/ingresos/actions";

interface Evento {
  id: string;
  cliente_nombre: string;
  fecha: string;
}

const TIPOS = [
  { value: "reserva", label: "Reserva" },
  { value: "sena", label: "Seña" },
  { value: "pago_final", label: "Pago final" },
  { value: "extra", label: "Extra" },
  { value: "cancelacion", label: "Cancelación (importe negativo)" },
  { value: "reembolso", label: "Reembolso (importe negativo)" },
];

export function IngresoForm({ eventos, eventoPreseleccionado }: { eventos: Evento[]; eventoPreseleccionado?: string }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(Boolean(eventoPreseleccionado));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const resultado = await crearIngresoAction(formData);
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
        + Nuevo ingreso
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nuevo ingreso</h2>
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
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</label>
          <select
            name="tipo"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label>
          <input
            type="date"
            name="fecha"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Evento asociado (opcional)
          </label>
          <select
            name="evento_id"
            defaultValue={eventoPreseleccionado ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">Sin evento asociado</option>
            {eventos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.cliente_nombre} — {e.fecha}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Importe</label>
          <input
            type="number"
            name="importe"
            step="0.01"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <p className="mt-1 text-xs text-slate-400">Para cancelaciones/reembolsos, cargar en negativo.</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Medio de pago</label>
          <select
            name="medio_pago"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">Sin especificar</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta_debito">Tarjeta débito</option>
            <option value="tarjeta_credito">Tarjeta crédito</option>
            <option value="mercado_pago">Mercado Pago</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Observaciones</label>
          <textarea
            name="observaciones"
            rows={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-slate-900"
          >
            {isPending ? "Guardando..." : "Registrar ingreso"}
          </button>
        </div>
      </form>
    </div>
  );
}
