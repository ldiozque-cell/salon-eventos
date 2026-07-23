import { createClient } from "@/lib/supabase/server";
import { ReporteForm } from "@/components/forms/ReporteForm";

export default async function ReportesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user!.id).single();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Reportes</h1>
        <p className="text-sm text-slate-900">
          Elegí el tipo de reporte y el formato. Los reportes con fecha muestran el período seleccionado; el resto
          muestra el estado actual.
        </p>
      </div>

      <ReporteForm esAdmin={perfil?.rol === "admin"} />
    </div>
  );
}
