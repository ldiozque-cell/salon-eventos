"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { agregarConsumoEventoAction } from "@/app/(dashboard)/eventos/actions";

interface Producto {
  id: string;
  nombre: string;
}

export function AgregarConsumoEventoForm({ eventoId, productos }: { eventoId: string; productos: Producto[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState(1);

  async function handleSubmit(formData: FormData) {
    setError(null);
    if (!productoId) {
      setError("Seleccioná un producto");
      return;
    }
    formData.set("items", JSON.stringify([{ producto_id: productoId, cantidad }]));

    startTransition(async () => {
      const resultado = await agregarConsumoEventoAction(eventoId, formData);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setProductoId("");
      setCantidad(1);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-wrap items-end gap-2">
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
      <select
        value={productoId}
        onChange={(e) => setProductoId(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
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
        value={cantidad}
        onChange={(e) => setCantidad(Number(e.target.value))}
        className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        {isPending ? "Agregando..." : "Agregar consumo"}
      </button>
    </form>
  );
}
