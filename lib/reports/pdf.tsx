import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { ColumnaReporte, DatosReporte } from "./excel";

const estilos = StyleSheet.create({
  page: { padding: 32, fontSize: 9, fontFamily: "Helvetica" },
  encabezado: { marginBottom: 16, borderBottom: "1 solid #1c2333", paddingBottom: 8 },
  titulo: { fontSize: 16, fontWeight: 700, marginBottom: 2, color: "#1c2333" },
  subtitulo: { fontSize: 9, color: "#5b6b85" },
  meta: { fontSize: 8, color: "#8b98ab", marginTop: 4 },
  tabla: { display: "flex", width: "100%" },
  filaEncabezado: {
    flexDirection: "row",
    backgroundColor: "#1c2333",
    color: "#ffffff",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  fila: {
    flexDirection: "row",
    borderBottom: "0.5 solid #e2e8f0",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  filaAlterna: { backgroundColor: "#f8fafc" },
  celda: { fontSize: 8 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    fontSize: 7,
    color: "#8b98ab",
    textAlign: "center",
  },
});

function formatearValor(valor: string | number | null, formato?: ColumnaReporte["formato"]) {
  if (valor === null || valor === undefined) return "—";
  if (formato === "moneda" && typeof valor === "number") return `$${valor.toFixed(2)}`;
  if (formato === "porcentaje" && typeof valor === "number") return `${valor.toFixed(1)}%`;
  return String(valor);
}

function ReportePdfDocument({ datos }: { datos: DatosReporte }) {
  const anchoColumna = `${100 / datos.columnas.length}%`;

  return (
    <Document>
      <Page size="A4" style={estilos.page} orientation="landscape">
        <View style={estilos.encabezado}>
          <Text style={estilos.titulo}>{datos.titulo}</Text>
          {datos.subtitulo && <Text style={estilos.subtitulo}>{datos.subtitulo}</Text>}
          <Text style={estilos.meta}>Generado el {new Date().toLocaleString("es-AR")}</Text>
        </View>

        <View style={estilos.tabla}>
          <View style={estilos.filaEncabezado} fixed>
            {datos.columnas.map((c) => (
              <Text key={c.clave} style={[estilos.celda, { width: anchoColumna, fontWeight: 700 }]}>
                {c.encabezado}
              </Text>
            ))}
          </View>

          {datos.filas.map((fila, index) => (
            <View key={index} style={[estilos.fila, index % 2 === 1 ? estilos.filaAlterna : {}]} wrap={false}>
              {datos.columnas.map((c) => (
                <Text key={c.clave} style={[estilos.celda, { width: anchoColumna }]}>
                  {formatearValor(fila[c.clave], c.formato)}
                </Text>
              ))}
            </View>
          ))}

          {datos.filas.length === 0 && (
            <View style={estilos.fila}>
              <Text style={estilos.celda}>Sin datos para el período seleccionado.</Text>
            </View>
          )}
        </View>

        <Text
          style={estilos.footer}
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages} · Colorín Colorado`}
          fixed
        />
      </Page>
    </Document>
  );
}

export async function generarPdf(datos: DatosReporte): Promise<Buffer> {
  return renderToBuffer(<ReportePdfDocument datos={datos} />);
}
