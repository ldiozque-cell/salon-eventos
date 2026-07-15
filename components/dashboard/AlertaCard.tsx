"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { marcarAlertaLeidaAction, marcarAlertaResueltaAction } from "@/app/(dashboard)/alertas/actions";

interface Alerta {
  id: string;
  tipo: string;
  severidad: "info" | "advertencia" | "critica";
  titulo: string;
  descripcion: string | null;
  leida: boolean;
  created_at: string;
}

const COLOR_SEVERIDAD: Record<string, string> = {
  info: "border-l-blue-400 bg-blue-50 dark:bg-blue-950/30",
  advertencia: "border-l-amber-400 bg-amber-50 dark:bg-amber-950/30",
  critica: "border-l-red-500 bg-red-50 dark:bg-red-950/30",
};

const ICONO_SEVERIDAD: Record<string, string> = {
  info: "ℹ️",
  advertencia: "⚠️",
  critica: "🔴",
};

export function AlertaCard({ alerta }: { alerta: Alerta }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function marcarLeida() {
    startTransition(async () => {
      await marcarAlertaLeidaAction(alerta.id);
      router.refresh();
    });
  }

  function marcarResuelta() {
    startTransition(async () => {
      await marcarAlertaResueltaAction(alerta.id);
      router.refresh();
    });
  }

  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-lg border-l-4 p-4 ${COLOR_SEVERIDAD[alerta.severidad]} ${
        alerta.leida ? "opacity-60" : ""
      }`}
    >
      <div className="flex gap-3">
        <span className="text-lg leading-none">{ICONO_SEVERIDAD[alerta.severidad]}</span>
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{alerta.titulo}</p>
          {alerta.descripcion && <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{alerta.descripcion}</p>}
          <p className="mt-1 text-xs text-slate-400">{new Date(alerta.created_at).toLocaleString("es-AR")}</p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        {!alerta.leida && (
          <button
            onClick={marcarLeida}
            disabled={isPending}
            className="rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-white disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Marcar leída
          </button>
        )}
        <button
          onClick={marcarResuelta}
          disabled={isPending}
          className="rounded-lg bg-slate-900 px-3 py-1 text-xs text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-slate-900"
        >
          Resolver
        </button>
      </div>
    </div>
  );
}
