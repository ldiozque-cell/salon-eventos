"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CrudModal } from "@/components/ui/CrudModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { showToast } from "@/components/ui/Toast";
import { IngresoForm } from "@/components/forms/IngresoForm";
import { actualizarIngresoAction, eliminarIngresoAction } from "@/app/(dashboard)/ingresos/actions";

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
  const [modoEdicion, setModoEdicion] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleEliminar = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const confirmarEliminar = useCallback(() => {
    startTransition(async () => {
      const resultado = await eliminarIngresoAction(ingresoId);
      if (!resultado.ok) {
        showToast("error", resultado.error);
        setShowConfirm(false);
        return;
      }
      showToast("exito", "Ingreso eliminado correctamente");
      setShowConfirm(false);
      router.refresh();
    });
  }, [ingresoId, router]);

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setModoEdicion(true)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Editar
        </button>
        <button
          onClick={handleEliminar}
          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          Eliminar
        </button>
      </div>

      <CrudModal abierto={modoEdicion} titulo="Editar ingreso" onClose={() => setModoEdicion(false)}>
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
          onGuardado={() => {
            setModoEdicion(false);
            showToast("exito", "Ingreso actualizado correctamente");
          }}
        />
      </CrudModal>

      <ConfirmDialog
        abierto={showConfirm}
        titulo="Eliminar ingreso"
        mensaje="¿Está seguro que desea eliminar este registro? Esta acción no se puede deshacer."
        textoConfirmar="Eliminar"
        variante="peligro"
        onConfirmar={confirmarEliminar}
        onCancelar={() => setShowConfirm(false)}
        isPending={isPending}
      />
    </>
  );
}
