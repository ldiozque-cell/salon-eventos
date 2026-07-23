"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { eliminarEventoAction } from "@/app/(dashboard)/eventos/actions";

export function EventoAcciones({ eventoId }: { eventoId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleEliminar() {
    if (!confirm("¿Estás seguro de eliminar este evento? Esta acción no se puede deshacer.")) return;
    startTransition(async () => {
      const resultado = await eliminarEventoAction(eventoId);
      if (!resultado.ok) {
        alert(resultado.error);
        return;
      }
      router.push("/eventos");
    });
  }

  return (
    <button
      onClick={handleEliminar}
      disabled={isPending}
      className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? "Eliminando..." : "Eliminar evento"}
    </button>
  );
}
