import { createClient } from "@/lib/supabase/server";
import { CompraForm } from "@/components/forms/CompraForm";

export default async function NuevaCompraPage() {
  const supabase = createClient();

  const [{ data: proveedores }, { data: productos }] = await Promise.all([
    supabase.from("proveedores").select("id, nombre").eq("activo", true).order("nombre"),
    supabase.from("productos").select("id, nombre, precio_actual").eq("estado", "activo").order("nombre"),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">Nueva compra</h1>
      <CompraForm proveedores={proveedores ?? []} productos={productos ?? []} />
    </div>
  );
}
