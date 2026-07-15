import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventosService } from "@/lib/services/eventos.service";
import { AgregarConsumoEventoForm } from "@/components/forms/AgregarConsumoEventoForm";

const ETIQUETA_ESTADO: Record<string, string> = {
  pendiente: "Pendiente",
  parcial: "Seña pagada",
  pagado: "Pagado",
  cancelado: "Cancelado",
};

export default async function DetalleEventoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const service = new EventosService(supabase);

  const [evento, { data: productos }] = await Promise.all([
    service.obtener(params.id).catch(() => null),
    supabase.from("productos").select("id, nombre").eq("estado", "activo").order("nombre"),
  ]);

  if (!evento) notFound();

  const costoInsumos = (evento as any).evento_consumos?.reduce(
    (acc: number, c: any) => acc + c.cantidad * (c.productos?.precio_actual ?? 0),
    0
  ) ?? 0;
  const margen = evento.total_cobrado - costoInsumos;
  const totalIngresos = (evento as any).ingresos?.reduce((acc: number, i: any) => acc + i.importe, 0) ?? 0;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{evento.cliente_nombre}</h1>
        <p className="text-sm text-slate-500">
          {evento.fecha} · {evento.hora.slice(0, 5)} hs · {evento.tematica ?? "sin temática"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Dato label="Niños" valor={String(evento.cantidad_ninos)} />
        <Dato label="Adultos" valor={String(evento.cantidad_adultos)} />
        <Dato label="Salón" valor={evento.salon ?? "—"} />
        <Dato label="Estado de pago" valor={ETIQUETA_ESTADO[evento.estado_pago]} />
      </div>

      <div className="grid grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <Dato label="Total cobrado" valor={`$${evento.total_cobrado.toFixed(2)}`} />
        <Dato label="Costo de insumos" valor={`$${costoInsumos.toFixed(2)}`} />
        <Dato label="Margen" valor={`$${margen.toFixed(2)}`} destacado={margen >= 0 ? "positivo" : "negativo"} />
      </div>

      {/* Consumo de productos */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Consumo de productos</h2>

        <ul className="mb-4 divide-y divide-slate-100 dark:divide-slate-800">
          {(evento as any).evento_consumos?.map((c: any) => (
            <li key={c.id} className="flex items-center justify-between py-2 text-sm">
              <span className="font-medium text-slate-900 dark:text-white">{c.productos?.nombre}</span>
              <span className="text-slate-500">
                {c.cantidad} × ${c.productos?.precio_actual?.toFixed(2)} = $
                {(c.cantidad * (c.productos?.precio_actual ?? 0)).toFixed(2)}
              </span>
            </li>
          ))}
          {(!(evento as any).evento_consumos || (evento as any).evento_consumos.length === 0) && (
            <li className="py-4 text-center text-sm text-slate-400">Todavía no se cargó consumo.</li>
          )}
        </ul>

        <AgregarConsumoEventoForm eventoId={evento.id} productos={productos ?? []} />
      </div>

      {/* Ingresos asociados */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Ingresos registrados ({`$${totalIngresos.toFixed(2)}`} de ${evento.total_cobrado.toFixed(2)})
        </h2>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {(evento as any).ingresos?.map((i: any) => (
            <li key={i.id} className="flex items-center justify-between py-2 text-sm">
              <span className="font-medium capitalize text-slate-900 dark:text-white">{i.tipo}</span>
              <span className="text-slate-500">
                {i.fecha} · ${i.importe.toFixed(2)}
              </span>
            </li>
          ))}
          {(!(evento as any).ingresos || (evento as any).ingresos.length === 0) && (
            <li className="py-4 text-center text-sm text-slate-400">
              Sin ingresos registrados todavía.{" "}
              <a href={`/ingresos?evento=${evento.id}`} className="text-slate-700 underline dark:text-slate-300">
                Registrar ingreso
              </a>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Dato({
  label,
  valor,
  destacado,
}: {
  label: string;
  valor: string;
  destacado?: "positivo" | "negativo";
}) {
  const color =
    destacado === "positivo"
      ? "text-green-600 dark:text-green-400"
      : destacado === "negativo"
      ? "text-red-600 dark:text-red-400"
      : "text-slate-900 dark:text-white";
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-lg font-semibold ${color}`}>{valor}</p>
    </div>
  );
}
