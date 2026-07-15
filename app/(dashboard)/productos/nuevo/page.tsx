import { createClient } from "@/lib/supabase/server";
import { ProductoForm } from "@/components/forms/ProductoForm";

export default async function NuevoProductoPage() {
  const supabase = createClient();
  const { data: categorias } = await supabase.from("categorias_producto").select("id, nombre").order("nombre");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">Nuevo producto</h1>
      <ProductoForm categorias={categorias ?? []} />
    </div>
  );
}
