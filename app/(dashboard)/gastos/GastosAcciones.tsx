"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CrudModal } from "@/components/ui/CrudModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { showToast } from "@/components/ui/Toast";
import { GastoForm } from "@/components/forms/GastoForm";
import { actualizarGastoAction, eliminarGastoAction } from "@/app/(dashboard)/gastos/actions";

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
  const [modoEdicion, setModoEdicion] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleEliminar = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const confirmarEliminar = useCallback(() => {
    startTransition(async () => {
      const resultado = await eliminarGastoAction(gastoId);
      if (resultado.ok === false) {
        showToast("error", resultado.error);
        setShowConfirm(false);
        return;
      }
      showToast("exito", "Gasto eliminado correctamente");
      setShowConfirm(false);
      router.refresh();
    });
  }, [gastoId, router]);

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

      <CrudModal abierto={modoEdicion} titulo="Editar gasto" onClose={() => setModoEdicion(false)}>
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
          onGuardado={() => {
            setModoEdicion(false);
            showToast("exito", "Gasto actualizado correctamente");
          }}
        />
      </CrudModal>

      <ConfirmDialog
        abierto={showConfirm}
        titulo="Eliminar gasto"
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
