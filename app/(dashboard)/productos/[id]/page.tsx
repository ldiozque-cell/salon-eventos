import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductosService } from "@/lib/services/productos.service";
import { ProductoForm } from "@/components/forms/ProductoForm";
import { ProductoAcciones } from "./ProductoAcciones";

const ETIQUETA_MOVIMIENTO: Record<string, string> = {
  entrada_compra: "Entrada por compra",
  salida_evento: "Salida por evento",
  ajuste_positivo: "Ajuste (+)",
  ajuste_negativo: "Ajuste (−)",
  perdida: "Pérdida",
  rotura: "Rotura",
  vencimiento: "Vencimiento",
};

export default async function DetalleProductoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const service = new ProductosService(supabase);

  const [producto, categoriasRes, historialPrecios, historialMovimientos] = await Promise.all([
    service.obtener(params.id).catch(() => null),
    supabase.from("categorias_producto").select("id, nombre").order("nombre"),
    service.historialPrecios(params.id),
    service.historialMovimientos(params.id),
  ]);

  const historialPreciosList = (historialPrecios ?? []) as Array<any>;
  const historialMovimientosList = (historialMovimientos ?? []) as Array<any>;

  if (!producto) notFound();

  const stockBajo = producto.stock_actual <= producto.stock_minimo;

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{producto.nombre}</h1>
          <p className="font-mono text-sm text-slate-900">{producto.codigo_interno}</p>
        </div>
        <ProductoAcciones productoId={producto.id} estado={producto.estado} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Dato label="Precio actual" valor={`$${producto.precio_actual.toFixed(2)}`} />
        <Dato
          label="Stock actual"
          valor={String(producto.stock_actual)}
          destacado={stockBajo ? "negativo" : undefined}
        />
        <Dato label="Stock mínimo" valor={String(producto.stock_minimo)} />
        <Dato label="Stock ideal" valor={String(producto.stock_ideal)} />
      </div>

      {/* Formulario de edición */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Editar datos</h2>
        <ProductoForm
          categorias={categoriasRes.data ?? []}
          productoId={producto.id}
          valoresIniciales={{
            codigo_interno: producto.codigo_interno,
            codigo_barras: producto.codigo_barras,
            nombre: producto.nombre,
            categoria_id: producto.categoria_id,
            marca: producto.marca,
            unidad_medida: producto.unidad_medida,
            presentacion: producto.presentacion,
            precio_actual: producto.precio_actual,
            stock_actual: producto.stock_actual,
            stock_minimo: producto.stock_minimo,
            stock_ideal: producto.stock_ideal,
            ubicacion_fisica: producto.ubicacion_fisica,
            estado: producto.estado,
          }}
        />
      </div>

      {/* Historial de precios */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Historial de precios</h2>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {historialPreciosList.map((h) => (
            <li key={h.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-slate-900">{new Date(h.fecha).toLocaleDateString("es-AR")}</span>
              <span>
                ${h.precio_anterior.toFixed(2)} → ${h.precio_nuevo.toFixed(2)}
              </span>
              <span className={h.variacion_porcentual >= 0 ? "text-red-600" : "text-green-600"}>
                {h.variacion_porcentual >= 0 ? "+" : ""}
                {h.variacion_porcentual}%
              </span>
            </li>
          ))}
          {historialPreciosList.length === 0 && (
            <li className="py-4 text-center text-sm text-slate-900">Sin cambios de precio registrados.</li>
          )}
        </ul>
      </div>

      {/* Historial de movimientos */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Últimos movimientos de stock
        </h2>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {historialMovimientosList.map((m) => (
            <li key={m.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-slate-900">{new Date(m.created_at).toLocaleString("es-AR")}</span>
              <span className="text-slate-600 dark:text-slate-300">{ETIQUETA_MOVIMIENTO[m.tipo] ?? m.tipo}</span>
              <span className={m.cantidad >= 0 ? "text-green-600" : "text-red-600"}>
                {m.cantidad >= 0 ? "+" : ""}
                {m.cantidad}
              </span>
            </li>
          ))}
          {historialMovimientosList.length === 0 && (
            <li className="py-4 text-center text-sm text-slate-900">Sin movimientos registrados.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Dato({ label, valor, destacado }: { label: string; valor: string; destacado?: "negativo" }) {
  return (
    <div>
      <p className="text-xs text-slate-900">{label}</p>
      <p className={`text-lg font-semibold ${destacado === "negativo" ? "text-red-600" : "text-slate-900 dark:text-white"}`}>
        {valor}
      </p>
    </div>
  );
}
