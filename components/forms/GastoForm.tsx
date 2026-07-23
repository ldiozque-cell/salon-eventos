"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearGastoAction } from "@/app/(dashboard)/gastos/actions";

interface Proveedor {
  id: string;
  nombre: string;
}

const CATEGORIAS = [
  { value: "alimentos", label: "Alimentos" },
  { value: "bebidas", label: "Bebidas" },
  { value: "limpieza", label: "Limpieza" },
  { value: "decoracion", label: "Decoración" },
  { value: "personal", label: "Personal" },
  { value: "servicios", label: "Servicios" },
  { value: "publicidad", label: "Publicidad" },
  { value: "reparaciones", label: "Reparaciones" },
  { value: "impuestos", label: "Impuestos" },
  { value: "otros", label: "Otros" },
];

export function GastoForm({ proveedores }: { proveedores: Proveedor[] }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const resultado = await crearGastoAction(formData);
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
      <button onClick={() => setAbierto(true)} className="btn-primary">
        + Nuevo gasto
      </button>
    );
  }

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Nuevo gasto</h2>
        <button onClick={() => setAbierto(false)} className="text-slate-400 hover:text-slate-600">
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Fecha</label>
          <input
            type="date"
            name="fecha"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Categoría</label>
          <select name="categoria" required className="select-field">
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Concepto</label>
          <input
            type="text"
            name="concepto"
            required
            placeholder="Ej: compra de servilletas y vasos"
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Proveedor (opcional)</label>
          <select name="proveedor_id" className="select-field">
            <option value="">Sin proveedor</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Importe</label>
          <input
            type="number"
            name="importe"
            min="0"
            step="0.01"
            required
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Medio de pago</label>
          <select name="medio_pago" className="select-field">
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
            className="input-field"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Registrar gasto"}
          </button>
        </div>
      </form>
    </div>
  );
}
