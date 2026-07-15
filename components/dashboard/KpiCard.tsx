interface KpiCardProps {
  label: string;
  valor: string;
  variacion?: { positiva: boolean; texto: string };
  tono?: "neutral" | "positivo" | "negativo" | "advertencia";
}

const TONOS: Record<NonNullable<KpiCardProps["tono"]>, string> = {
  neutral: "text-slate-900 dark:text-white",
  positivo: "text-green-600 dark:text-green-400",
  negativo: "text-red-600 dark:text-red-400",
  advertencia: "text-amber-600 dark:text-amber-400",
};

export function KpiCard({ label, valor, variacion, tono = "neutral" }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${TONOS[tono]}`}>{valor}</p>
      {variacion && (
        <p className={`mt-1 text-xs ${variacion.positiva ? "text-green-600" : "text-red-600"}`}>
          {variacion.texto}
        </p>
      )}
    </div>
  );
}
