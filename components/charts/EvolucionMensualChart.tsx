"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Punto {
  mes: string;
  ingresos: number;
  gastos: number;
  ganancia: number;
}

function formatearMes(mesIso: string) {
  const fecha = new Date(mesIso);
  return fecha.toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
}

export function EvolucionMensualChart({ datos }: { datos: Punto[] }) {
  const datosFormateados = datos.map((d) => ({ ...d, mesLabel: formatearMes(d.mes) }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={datosFormateados} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="mesLabel" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
        <Tooltip
          formatter={(value: number) => `$${value.toLocaleString("es-AR")}`}
          contentStyle={{ borderRadius: 8, fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#16a34a" fill="url(#colorIngresos)" strokeWidth={2} />
        <Area type="monotone" dataKey="gastos" name="Gastos" stroke="#dc2626" fill="url(#colorGastos)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
