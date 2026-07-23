"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CrudModal } from "@/components/ui/CrudModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { showToast } from "@/components/ui/Toast";
import { EventoEditForm } from "@/components/forms/EventoEditForm";
import { eliminarEventoAction } from "@/app/(dashboard)/eventos/actions";

interface EventoAccionesProps {
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
}

export function EventoAcciones({ eventoId, valoresIniciales }: EventoAccionesProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modoEdicion, setModoEdicion] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleEliminar = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const confirmarEliminar = useCallback(() => {
    startTransition(async () => {
      const resultado = await eliminarEventoAction(eventoId);
      if (!resultado.ok) {
        showToast("error", resultado.error);
        setShowConfirm(false);
        return;
      }
      showToast("exito", "Evento eliminado correctamente");
      setShowConfirm(false);
      router.push("/eventos");
    });
  }, [eventoId, router]);

  return (
    <>
      <div className="flex items-center gap-2">
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

      <CrudModal abierto={modoEdicion} titulo="Editar evento" onClose={() => setModoEdicion(false)}>
        <EventoEditForm
          eventoId={eventoId}
          valoresIniciales={valoresIniciales}
          onGuardado={() => {
            setModoEdicion(false);
            showToast("exito", "Evento actualizado correctamente");
          }}
        />
      </CrudModal>

      <ConfirmDialog
        abierto={showConfirm}
        titulo="Eliminar evento"
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
