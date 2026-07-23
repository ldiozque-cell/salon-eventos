import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProveedoresService } from "@/lib/services/proveedores.service";
import { ProveedorForm } from "@/components/forms/ProveedorForm";

export default async function FichaProveedorPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const service = new ProveedoresService(supabase);

  const ficha = await service.obtenerFicha(params.id).catch(() => null);
  if (!ficha?.proveedor) notFound();

  const { proveedor, productos, historial, resumen } = ficha;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{proveedor.nombre}</h1>
        <p className="text-sm text-slate-900">{proveedor.empresa ?? "Sin empresa registrada"}</p>
      </div>

      {/* Métricas agregadas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Dato label="Total comprado" valor={`$${(resumen?.total_comprado ?? 0).toFixed(2)}`} />
        <Dato label="Cantidad de compras" valor={String(resumen?.cantidad_compras ?? 0)} />
        <Dato label="Última compra" valor={resumen?.ultima_compra ?? "—"} />
        <Dato label="Promedio mensual" valor={`$${(resumen?.promedio_mensual ?? 0).toFixed(2)}`} />
      </div>

      {/* Formulario de edición */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Editar datos</h2>
        <ProveedorForm
          proveedorId={proveedor.id}
          valoresIniciales={{
            nombre: proveedor.nombre,
            empresa: proveedor.empresa,
            responsable: proveedor.responsable,
            telefono: proveedor.telefono,
            whatsapp: proveedor.whatsapp,
            email: proveedor.email,
            direccion: proveedor.direccion,
            ciudad: proveedor.ciudad,
            observaciones: proveedor.observaciones,
            horarios_atencion: proveedor.horarios_atencion,
            condiciones_pago: proveedor.condiciones_pago,
            activo: proveedor.activo,
          }}
        />
      </div>

      {/* Productos asociados */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Productos asociados</h2>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {productos?.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-2 text-sm">
              <Link href={`/productos/${p.id}`} className="font-medium text-slate-900 hover:underline dark:text-white">
                {p.nombre}
              </Link>
              <span className="text-slate-900">
                ${p.precio_actual.toFixed(2)} · stock: {p.stock_actual}
              </span>
            </li>
          ))}
          {(!productos || productos.length === 0) && (
            <li className="py-4 text-center text-sm text-slate-900">Sin productos asociados como proveedor principal.</li>
          )}
        </ul>
      </div>

      {/* Historial de compras */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Historial de compras</h2>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {historial?.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-2 text-sm">
              <Link href={`/compras/${c.id}`} className="text-slate-900 hover:underline">
                {c.fecha} {c.numero_factura ? `· Fact. ${c.numero_factura}` : ""}
              </Link>
              <span className="font-medium text-slate-900 dark:text-white">${c.total.toFixed(2)}</span>
            </li>
          ))}
          {(!historial || historial.length === 0) && (
            <li className="py-4 text-center text-sm text-slate-900">Sin compras registradas todavía.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-slate-900">{label}</p>
      <p className="text-lg font-semibold text-slate-900 dark:text-white">{valor}</p>
    </div>
  );
}
