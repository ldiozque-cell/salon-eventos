import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ReportesService, ReporteTipoInvalidoError, type TipoReporte } from "@/lib/services/reportes.service";
import { generarExcel } from "@/lib/reports/excel";
import { generarPdf } from "@/lib/reports/pdf";

// @react-pdf/renderer y exceljs necesitan APIs de Node (Buffer, streams),
// no funcionan en el runtime "edge".
export const runtime = "nodejs";

const TIPOS_VALIDOS: TipoReporte[] = [
  "inventario",
  "compras",
  "proveedores",
  "eventos",
  "ingresos",
  "gastos",
  "balance",
  "productos-mas-utilizados",
  "productos-menos-utilizados",
  "rentabilidad",
  "estadisticas",
];

export async function GET(request: NextRequest, { params }: { params: { tipo: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const tipo = params.tipo as TipoReporte;
  if (!TIPOS_VALIDOS.includes(tipo)) {
    return NextResponse.json({ error: `Tipo de reporte inválido: ${tipo}` }, { status: 400 });
  }

  // Los reportes financieros (gastos, ingresos, balance, rentabilidad) solo
  // para admin — mismo criterio de roles que el resto de la app.
  const REPORTES_SOLO_ADMIN: TipoReporte[] = ["gastos", "ingresos", "balance", "rentabilidad"];
  if (REPORTES_SOLO_ADMIN.includes(tipo)) {
    const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
    if (perfil?.rol !== "admin") {
      return NextResponse.json({ error: "Solo un administrador puede generar este reporte" }, { status: 403 });
    }
  }

  const { searchParams } = new URL(request.url);
  const formato = searchParams.get("formato") === "excel" ? "excel" : "pdf";
  const desde = searchParams.get("desde") ?? undefined;
  const hasta = searchParams.get("hasta") ?? undefined;

  try {
    const service = new ReportesService(supabase);
    const datos = await service.obtenerDatos(tipo, { desde, hasta });

    const nombreArchivo = `${tipo}-${new Date().toISOString().slice(0, 10)}`;

    if (formato === "excel") {
      const buffer = await generarExcel(datos);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${nombreArchivo}.xlsx"`,
        },
      });
    }

    const buffer = await generarPdf(datos);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nombreArchivo}.pdf"`,
      },
    });
  } catch (error) {
    if (error instanceof ReporteTipoInvalidoError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Ocurrió un error al generar el reporte" }, { status: 500 });
  }
}
