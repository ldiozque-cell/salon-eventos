"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GastoForm } from "@/components/forms/GastoForm";
import { eliminarGastoAction } from "@/app/(dashboard)/gastos/actions";

interface Proveedor {
  id: string;
  nombre: string;
}

interface GastosAccionesProps {
  gastoId: string;
  gasto: {
    fecha: string;
    categoria: string;
    concepto: string;
    proveedor_id: string | null;
    importe: number;
    medio_pago: string | null;
    observaciones: string | null;
  };
  proveedores: Proveedor[];
}

export function GastosAcciones({ gastoId, gasto, proveedores }: GastosAccionesProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modo, setModo] = useState<"lista" | "edicion">("lista");
  const [error, setError] = useState<string | null>(null);

  function handleEliminar() {
    if (!confirm("¿Estás seguro de eliminar este gasto?")) return;
    startTransition(async () => {
      const resultado = await eliminarGastoAction(gastoId);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      router.refresh();
    });
  }

  if (modo === "edicion") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
          <GastoForm
            proveedores={proveedores}
            gastoId={gastoId}
            valoresIniciales={{
              fecha: gasto.fecha,
              categoria: gasto.categoria,
              concepto: gasto.concepto,
              proveedor_id: gasto.proveedor_id ?? "",
              importe: gasto.importe,
              medio_pago: gasto.medio_pago ?? "",
              observaciones: gasto.observaciones ?? "",
            }}
            onGuardado={() => setModo("lista")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-xs text-red-500">{error}</span>}
      <button
        onClick={() => setModo("edicion")}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        Editar
      </button>
      <button
        onClick={handleEliminar}
        disabled={isPending}
        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {isPending ? "..." : "Eliminar"}
      </button>
    </div>
  );
}
