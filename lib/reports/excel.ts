import ExcelJS from "exceljs";

export interface ColumnaReporte {
  clave: string;
  encabezado: string;
  ancho?: number;
  formato?: "moneda" | "fecha" | "porcentaje" | "texto";
}

export interface DatosReporte {
  titulo: string;
  subtitulo?: string;
  columnas: ColumnaReporte[];
  filas: Record<string, string | number | null>[];
}

/**
 * Genera un .xlsx a partir de una definición genérica de columnas/filas.
 * Se centraliza acá para que todos los reportes (inventario, compras,
 * eventos, etc.) tengan el mismo estilo (encabezado, formato de moneda,
 * ancho de columna) sin repetir código en cada uno.
 */
export async function generarExcel(datos: DatosReporte): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Salón de Eventos — Sistema de Gestión";
  workbook.created = new Date();

  const hoja = workbook.addWorksheet(datos.titulo.slice(0, 31)); // Excel limita el nombre a 31 chars

  hoja.columns = datos.columnas.map((c) => ({
    header: c.encabezado,
    key: c.clave,
    width: c.ancho ?? 20,
  }));

  // Encabezado con estilo
  hoja.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  hoja.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1C2333" },
  };
  hoja.getRow(1).alignment = { vertical: "middle" };

  datos.filas.forEach((fila) => {
    hoja.addRow(fila);
  });

  // Formato numérico por columna según el tipo declarado
  datos.columnas.forEach((c, index) => {
    const col = hoja.getColumn(index + 1);
    if (c.formato === "moneda") {
      col.numFmt = '"$"#,##0.00';
    } else if (c.formato === "porcentaje") {
      col.numFmt = "0.00%";
    }
  });

  hoja.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: datos.columnas.length },
  };
  hoja.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
