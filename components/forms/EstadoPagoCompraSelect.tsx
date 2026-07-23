"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { actualizarEstadoPagoCompraAction } from "@/app/(dashboard)/compras/actions";

const OPCIONES = [
  { value: "pendiente", label: "Pendiente" },
  { value: "parcial", label: "Parcial" },
  { value: "pagado", label: "Pagado" },
  { value: "cancelado", label: "Cancelado" },
];

export function EstadoPagoCompraSelect({ compraId, estadoActual }: { compraId: string; estadoActual: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(nuevoEstado: string) {
    startTransition(async () => {
      await actualizarEstadoPagoCompraAction(compraId, nuevoEstado as any);
      router.refresh();
    });
  }

  return (
    <select
      defaultValue={estadoActual}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 disabled:opacity-50 dark:border-slate-700"
    >
      {OPCIONES.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
