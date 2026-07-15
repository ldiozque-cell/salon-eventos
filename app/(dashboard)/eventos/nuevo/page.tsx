import { createClient } from "@/lib/supabase/server";
import { EventoForm } from "@/components/forms/EventoForm";

export default async function NuevoEventoPage() {
  const supabase = createClient();
  const { data: productos } = await supabase
    .from("productos")
    .select("id, nombre")
    .eq("estado", "activo")
    .order("nombre");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">Nuevo evento</h1>
      <EventoForm productos={productos ?? []} />
    </div>
  );
}
