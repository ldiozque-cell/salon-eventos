import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProveedoresService } from "@/lib/services/proveedores.service";

export default async function ProveedoresPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const supabase = createClient();
  const service = new ProveedoresService(supabase);

  const page = Number(searchParams.page ?? "1");
  const { data: proveedores, count } = await service.listar({
    busqueda: searchParams.q,
    activo: true,
    page,
    pageSize: 25,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title">Proveedores</h1>
          <p className="page-subtitle">{count} proveedores activos</p>
        </div>
        <Link
          href="/proveedores/nuevo"
          className="btn-primary"
        >
          + Nuevo proveedor
        </Link>
      </div>

      <form className="mb-4" method="get">
        <input
          type="search"
          name="q"
          defaultValue={searchParams.q}
          placeholder="Buscar por nombre o empresa..."
          className="input-field w-80"
        />
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Teléfono / WhatsApp</th>
              <th className="px-4 py-3">Ciudad</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {proveedores?.map((p) => (
              <tr key={p.id} className="table-row-hover">
                <td className="px-4 py-3 font-medium text-slate-800">{p.nombre}</td>
                <td className="px-4 py-3 text-slate-700">{p.empresa ?? "—"}</td>
                <td className="px-4 py-3 text-slate-700">{p.whatsapp ?? p.telefono ?? "—"}</td>
                <td className="px-4 py-3 text-slate-700">{p.ciudad ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/proveedores/${p.id}`} className="text-brand-500 hover:text-brand-600 font-medium">
                    Ver ficha
                  </Link>
                </td>
              </tr>
            ))}
            {proveedores?.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-state">
                  No se encontraron proveedores.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
