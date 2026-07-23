"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { actualizarEventoAction } from "@/app/(dashboard)/eventos/actions";

interface EventoEditFormProps {
  eventoId: string;
  valoresIniciales: {
    cliente_nombre: string;
    cliente_telefono: string | null;
    fecha: string;
    hora: string;
    cantidad_ninos: number;
    cantidad_adultos: number;
    tematica: string | null;
    salon: string | null;
    estado_pago: string;
    total_cobrado: number;
  };
  onGuardado?: () => void;
}

export function EventoEditForm({ eventoId, valoresIniciales, onGuardado }: EventoEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const resultado = await actualizarEventoAction(eventoId, formData);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      onGuardado?.();
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Cliente</label>
          <input
            type="text"
            name="cliente_nombre"
            defaultValue={valoresIniciales.cliente_nombre}
            required
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Teléfono</label>
          <input
            type="text"
            name="cliente_telefono"
            defaultValue={valoresIniciales.cliente_telefono ?? ""}
            className="input-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Fecha</label>
          <input
            type="date"
            name="fecha"
            defaultValue={valoresIniciales.fecha}
            required
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Hora</label>
          <input
            type="time"
            name="hora"
            defaultValue={valoresIniciales.hora}
            required
            className="input-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Cantidad de niños</label>
          <input
            type="number"
            name="cantidad_ninos"
            min="0"
            defaultValue={valoresIniciales.cantidad_ninos}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Cantidad de adultos</label>
          <input
            type="number"
            name="cantidad_adultos"
            min="0"
            defaultValue={valoresIniciales.cantidad_adultos}
            className="input-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Temática</label>
          <input
            type="text"
            name="tematica"
            defaultValue={valoresIniciales.tematica ?? ""}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Salón</label>
          <input
            type="text"
            name="salon"
            defaultValue={valoresIniciales.salon ?? ""}
            className="input-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Total cobrado</label>
          <input
            type="number"
            name="total_cobrado"
            min="0"
            step="0.01"
            defaultValue={valoresIniciales.total_cobrado}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Estado de pago</label>
          <select name="estado_pago" defaultValue={valoresIniciales.estado_pago} className="select-field">
            <option value="pendiente">Pendiente</option>
            <option value="parcial">Seña pagada</option>
            <option value="pagado">Pagado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
