"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearEventoAction } from "@/app/(dashboard)/eventos/actions";

interface Producto {
  id: string;
  nombre: string;
}

interface ConsumoItem {
  producto_id: string;
  cantidad: number;
}

export function EventoForm({ productos }: { productos: Producto[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [consumos, setConsumos] = useState<ConsumoItem[]>([]);

  function agregarConsumo() {
    setConsumos((prev) => [...prev, { producto_id: "", cantidad: 1 }]);
  }

  function quitarConsumo(index: number) {
    setConsumos((prev) => prev.filter((_, i) => i !== index));
  }

  function actualizarConsumo(index: number, cambios: Partial<ConsumoItem>) {
    setConsumos((prev) => prev.map((item, i) => (i === index ? { ...item, ...cambios } : item)));
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("consumos", JSON.stringify(consumos.filter((c) => c.producto_id)));

    startTransition(async () => {
      const resultado = await crearEventoAction(formData);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      router.push(`/eventos/${resultado.data.id}`);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Cliente</label>
          <input
            type="text"
            name="cliente_nombre"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
          <input
            type="text"
            name="cliente_telefono"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label>
          <input
            type="date"
            name="fecha"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Hora</label>
          <input
            type="time"
            name="hora"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Cantidad de niños</label>
          <input
            type="number"
            name="cantidad_ninos"
            min="0"
            defaultValue={0}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Cantidad de adultos</label>
          <input
            type="number"
            name="cantidad_adultos"
            min="0"
            defaultValue={0}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Temática</label>
          <input
            type="text"
            name="tematica"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Salón</label>
          <input
            type="text"
            name="salon"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Total cobrado</label>
          <input
            type="number"
            name="total_cobrado"
            min="0"
            step="0.01"
            defaultValue={0}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Estado de pago</label>
          <select
            name="estado_pago"
            defaultValue="pendiente"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          >
            <option value="pendiente">Pendiente</option>
            <option value="parcial">Seña pagada</option>
            <option value="pagado">Pagado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Consumo de productos (Módulo 7) — opcional al crear, se puede cargar después */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Consumo de productos <span className="font-normal text-slate-400">(opcional, se puede cargar después)</span>
          </label>
          <button
            type="button"
            onClick={agregarConsumo}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            + Agregar producto
          </button>
        </div>

        <div className="space-y-2">
          {consumos.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <select
                value={item.producto_id}
                onChange={(e) => actualizarConsumo(index, { producto_id: e.target.value })}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
              >
                <option value="">Producto...</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={item.cantidad}
                onChange={(e) => actualizarConsumo(index, { cantidad: Number(e.target.value) })}
                placeholder="Cant."
                className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
              />
              <button
                type="button"
                onClick={() => quitarConsumo(index)}
                className="text-slate-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-slate-900"
      >
        {isPending ? "Guardando..." : "Crear evento"}
      </button>
    </form>
  );
}
