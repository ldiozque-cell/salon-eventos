"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { darDeBajaProveedorAction } from "@/app/(dashboard)/proveedores/actions";

export function ProveedorAcciones({ proveedorId, activo }: { proveedorId: string; activo: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDesactivar() {
    if (!confirm("¿Estás seguro de desactivar este proveedor? No aparecerá en las listas activas.")) return;
    startTransition(async () => {
      const resultado = await darDeBajaProveedorAction(proveedorId);
      if (!resultado.ok) {
        alert(resultado.error);
        return;
      }
      router.refresh();
    });
  }

  if (!activo) return null;

  return (
    <button
      onClick={handleDesactivar}
      disabled={isPending}
      className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? "..." : "Desactivar proveedor"}
    </button>
  );
}
