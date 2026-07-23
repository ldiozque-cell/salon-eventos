"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IngresoForm } from "@/components/forms/IngresoForm";
import { eliminarIngresoAction } from "@/app/(dashboard)/ingresos/actions";

interface Evento {
  id: string;
  cliente_nombre: string;
  fecha: string;
}

interface IngresosAccionesProps {
  ingresoId: string;
  ingreso: {
    tipo: string;
    fecha: string;
    evento_id: string | null;
    importe: number;
    medio_pago: string | null;
    observaciones: string | null;
  };
  eventos: Evento[];
}

export function IngresosAcciones({ ingresoId, ingreso, eventos }: IngresosAccionesProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modo, setModo] = useState<"lista" | "edicion">("lista");
  const [error, setError] = useState<string | null>(null);

  function handleEliminar() {
    if (!confirm("¿Estás seguro de eliminar este ingreso?")) return;
    startTransition(async () => {
      const resultado = await eliminarIngresoAction(ingresoId);
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
          <IngresoForm
            eventos={eventos}
            ingresoId={ingresoId}
            valoresIniciales={{
              tipo: ingreso.tipo,
              fecha: ingreso.fecha,
              evento_id: ingreso.evento_id ?? "",
              importe: ingreso.importe,
              medio_pago: ingreso.medio_pago ?? "",
              observaciones: ingreso.observaciones ?? "",
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
