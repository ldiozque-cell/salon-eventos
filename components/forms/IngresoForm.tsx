"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearIngresoAction, actualizarIngresoAction } from "@/app/(dashboard)/ingresos/actions";

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

interface IngresoFormProps {
  eventos: Evento[];
  eventoPreseleccionado?: string;
  ingresoId?: string;
  valoresIniciales?: {
    tipo?: string;
    fecha?: string;
    evento_id?: string;
    importe?: number;
    medio_pago?: string;
    observaciones?: string;
  };
  onGuardado?: () => void;
}

export function IngresoForm({
  eventos,
  eventoPreseleccionado,
  ingresoId,
  valoresIniciales,
  onGuardado,
}: IngresoFormProps) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(Boolean(eventoPreseleccionado));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const esEdicion = Boolean(ingresoId);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const resultado = esEdicion
        ? await actualizarIngresoAction(ingresoId!, formData)
        : await crearIngresoAction(formData);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setAbierto(false);
      onGuardado?.();
      router.refresh();
    });
  }

  if (!abierto && !esEdicion) {
    return (
      <button onClick={() => setAbierto(true)} className="btn-primary">
        + Nuevo ingreso
      </button>
    );
  }

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">
          {esEdicion ? "Editar ingreso" : "Nuevo ingreso"}
        </h2>
        {!esEdicion && (
          <button onClick={() => setAbierto(false)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Tipo</label>
          <select name="tipo" required defaultValue={valoresIniciales?.tipo ?? ""} className="select-field">
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Fecha</label>
          <input
            type="date"
            name="fecha"
            defaultValue={valoresIniciales?.fecha ?? new Date().toISOString().slice(0, 10)}
            required
            className="input-field"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Evento asociado (opcional)
          </label>
          <select
            name="evento_id"
            defaultValue={valoresIniciales?.evento_id ?? eventoPreseleccionado ?? ""}
            className="select-field"
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
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Importe</label>
          <input
            type="number"
            name="importe"
            step="0.01"
            defaultValue={valoresIniciales?.importe ?? ""}
            required
            className="input-field"
          />
          <p className="mt-1 text-xs text-slate-500">Para cancelaciones/reembolsos, cargar en negativo.</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Medio de pago</label>
          <select name="medio_pago" defaultValue={valoresIniciales?.medio_pago ?? ""} className="select-field">
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
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Observaciones</label>
          <textarea
            name="observaciones"
            rows={2}
            defaultValue={valoresIniciales?.observaciones ?? ""}
            className="input-field"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary disabled:opacity-50"
          >
            {isPending ? "Guardando..." : esEdicion ? "Guardar cambios" : "Registrar ingreso"}
          </button>
        </div>
      </form>
    </div>
  );
}
