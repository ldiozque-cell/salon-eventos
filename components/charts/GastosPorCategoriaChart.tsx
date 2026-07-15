"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Punto {
  categoria: string;
  total: number;
}

const COLORES = ["#374357", "#5b6b85", "#8b98ab", "#b3bccb", "#374357", "#5b6b85", "#8b98ab", "#b3bccb", "#374357", "#5b6b85"];

const ETIQUETAS: Record<string, string> = {
  alimentos: "Alimentos",
  bebidas: "Bebidas",
  limpieza: "Limpieza",
  decoracion: "Decoración",
  personal: "Personal",
  servicios: "Servicios",
  publicidad: "Publicidad",
  reparaciones: "Reparaciones",
  impuestos: "Impuestos",
  otros: "Otros",
};

export function GastosPorCategoriaChart({ datos }: { datos: Punto[] }) {
  const datosFormateados = datos
    .map((d) => ({ ...d, etiqueta: ETIQUETAS[d.categoria] ?? d.categoria }))
    .sort((a, b) => b.total - a.total);

  if (datosFormateados.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
        Todavía no hay gastos registrados este mes.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={datosFormateados} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
        <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis dataKey="etiqueta" type="category" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
        <Tooltip formatter={(value: number) => `$${value.toLocaleString("es-AR")}`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        <Bar dataKey="total" radius={[0, 4, 4, 0]}>
          {datosFormateados.map((_, index) => (
            <Cell key={index} fill={COLORES[index % COLORES.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
