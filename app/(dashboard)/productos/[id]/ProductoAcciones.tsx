"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { showToast } from "@/components/ui/Toast";
import { darDeBajaProductoAction } from "@/app/(dashboard)/productos/actions";

export function ProductoAcciones({ productoId, estado }: { productoId: string; estado: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDesactivar = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const confirmarDesactivar = useCallback(() => {
    startTransition(async () => {
      const resultado = await darDeBajaProductoAction(productoId);
      if (resultado.ok === false) {
        showToast("error", resultado.error);
        setShowConfirm(false);
        return;
      }
      showToast("exito", "Producto desactivado correctamente");
      setShowConfirm(false);
      router.refresh();
    });
  }, [productoId, router]);

  if (estado !== "activo") return null;

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
        titulo="Desactivar producto"
        mensaje="¿Está seguro que desea desactivar este producto? No aparecerá en las listas activas."
        textoConfirmar="Desactivar"
        variante="peligro"
        onConfirmar={confirmarDesactivar}
        onCancelar={() => setShowConfirm(false)}
        isPending={isPending}
      />
    </>
  );
}
