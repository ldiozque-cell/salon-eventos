interface KpiCardProps {
  label: string;
  valor: string;
  variacion?: { positiva: boolean; texto: string };
  tono?: "neutral" | "positivo" | "negativo" | "advertencia";
}

const TONOS: Record<NonNullable<KpiCardProps["tono"]>, string> = {
  neutral: "text-slate-700",
  positivo: "text-green-600",
  negativo: "text-red-500",
  advertencia: "text-amber-600",
};

const FONDOS: Record<NonNullable<KpiCardProps["tono"]>, string> = {
  neutral: "from-sky-50 to-blue-50",
  positivo: "from-green-50 to-emerald-50",
  negativo: "from-red-50 to-rose-50",
  advertencia: "from-amber-50 to-yellow-50",
};

const ICONOS: Record<NonNullable<KpiCardProps["tono"]>, string> = {
  neutral: "bg-sky-100 text-sky-600",
  positivo: "bg-green-100 text-green-600",
  negativo: "bg-red-100 text-red-500",
  advertencia: "bg-amber-100 text-amber-600",
};

export function KpiCard({ label, valor, variacion, tono = "neutral" }: KpiCardProps) {
  return (
    <div className={`rounded-xl border border-slate-200/50 bg-gradient-to-br ${FONDOS[tono]} p-5 shadow-sm transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <div className={`rounded-lg p-2 ${ICONOS[tono]}`}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
          </svg>
        </div>
      </div>
      <p className={`mt-2 text-3xl font-bold ${TONOS[tono]}`}>{valor}</p>
      {variacion && (
        <p className={`mt-2 text-xs font-medium ${variacion.positiva ? "text-green-600" : "text-red-500"}`}>
          {variacion.texto}
        </p>
      )}
    </div>
  );
}
