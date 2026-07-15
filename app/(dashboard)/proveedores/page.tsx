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
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Proveedores</h1>
          <p className="text-sm text-slate-500">{count} proveedores activos</p>
        </div>
        <Link
          href="/proveedores/nuevo"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900"
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
          className="w-80 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Teléfono / WhatsApp</th>
              <th className="px-4 py-3">Ciudad</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {proveedores?.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.nombre}</td>
                <td className="px-4 py-3 text-slate-500">{p.empresa ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">{p.whatsapp ?? p.telefono ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">{p.ciudad ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/proveedores/${p.id}`} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                    Ver ficha
                  </Link>
                </td>
              </tr>
            ))}
            {proveedores?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
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
