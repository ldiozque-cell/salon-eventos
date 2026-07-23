"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { showToast } from "@/components/ui/Toast";
import { darDeBajaProveedorAction } from "@/app/(dashboard)/proveedores/actions";

export function ProveedorAcciones({ proveedorId, activo }: { proveedorId: string; activo: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDesactivar = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const confirmarDesactivar = useCallback(() => {
    startTransition(async () => {
      const resultado = await darDeBajaProveedorAction(proveedorId);
      if (resultado.ok === false) {
        showToast("error", resultado.error);
        setShowConfirm(false);
        return;
      }
      showToast("exito", "Proveedor desactivado correctamente");
      setShowConfirm(false);
      router.refresh();
    });
  }, [proveedorId, router]);

  if (!activo) return null;

  return (
    <>
      <button
        onClick={handleDesactivar}
        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        Desactivar
      </button>

      <ConfirmDialog
        abierto={showConfirm}
        titulo="Desactivar proveedor"
        mensaje="¿Está seguro que desea desactivar este proveedor? No aparecerá en las listas activas."
        textoConfirmar="Desactivar"
        variante="peligro"
        onConfirmar={confirmarDesactivar}
        onCancelar={() => setShowConfirm(false)}
        isPending={isPending}
      />
    </>
  );
}
