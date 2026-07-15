import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { ColumnaReporte, DatosReporte } from "@/lib/reports/excel";

export type TipoReporte =
  | "inventario"
  | "compras"
  | "proveedores"
  | "eventos"
  | "ingresos"
  | "gastos"
  | "balance"
  | "productos-mas-utilizados"
  | "productos-menos-utilizados"
  | "rentabilidad"
  | "estadisticas";

export interface FiltrosReporte {
  desde?: string;
  hasta?: string;
}

const TITULOS: Record<TipoReporte, string> = {
  inventario: "Reporte de Inventario",
  compras: "Reporte de Compras",
  proveedores: "Reporte de Proveedores",
  eventos: "Reporte de Eventos",
  ingresos: "Reporte de Ingresos",
  gastos: "Reporte de Gastos",
  balance: "Reporte de Balance",
  "productos-mas-utilizados": "Productos Más Utilizados",
  "productos-menos-utilizados": "Productos Menos Utilizados",
  rentabilidad: "Reporte de Rentabilidad por Evento",
  estadisticas: "Estadísticas Inteligentes",
};

export class ReporteTipoInvalidoError extends Error {
  constructor(tipo: string) {
    super(`Tipo de reporte no reconocido: ${tipo}`);
    this.name = "ReporteTipoInvalidoError";
  }
}

/**
 * Cada método devuelve columnas + filas ya en el formato genérico que
 * consumen tanto el generador de Excel como el de PDF (ver lib/reports/).
 * Así el reporte se define una sola vez y se puede exportar en cualquiera
 * de los dos formatos sin duplicar la consulta ni el mapeo de columnas.
 */
export class ReportesService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async obtenerDatos(tipo: TipoReporte, filtros: FiltrosReporte): Promise<DatosReporte> {
    switch (tipo) {
      case "inventario":
        return this.reporteInventario();
      case "compras":
        return this.reporteCompras(filtros);
      case "proveedores":
        return this.reporteProveedores();
      case "eventos":
        return this.reporteEventos(filtros);
      case "ingresos":
        return this.reporteIngresos(filtros);
      case "gastos":
        return this.reporteGastos(filtros);
      case "balance":
        return this.reporteBalance();
      case "productos-mas-utilizados":
        return this.reporteProductosMasUtilizados();
      case "productos-menos-utilizados":
        return this.reporteProductosMenosUtilizados();
      case "rentabilidad":
        return this.reporteRentabilidad(filtros);
      case "estadisticas":
        return this.reporteEstadisticas();
      default:
        throw new ReporteTipoInvalidoError(tipo);
    }
  }

  private subtitulo(filtros: FiltrosReporte) {
    if (filtros.desde && filtros.hasta) return `Período: ${filtros.desde} a ${filtros.hasta}`;
    if (filtros.desde) return `Desde: ${filtros.desde}`;
    if (filtros.hasta) return `Hasta: ${filtros.hasta}`;
    return undefined;
  }

  private async reporteInventario(): Promise<DatosReporte> {
    const { data, error } = await this.supabase
      .from("productos")
      .select("codigo_interno, nombre, stock_actual, stock_minimo, precio_actual, estado")
      .order("nombre");
    if (error) throw error;

    const columnas: ColumnaReporte[] = [
      { clave: "codigo_interno", encabezado: "Código", ancho: 14 },
      { clave: "nombre", encabezado: "Producto", ancho: 30 },
      { clave: "stock_actual", encabezado: "Stock actual", ancho: 14 },
      { clave: "stock_minimo", encabezado: "Stock mínimo", ancho: 14 },
      { clave: "precio_actual", encabezado: "Precio", ancho: 14, formato: "moneda" },
      { clave: "estado", encabezado: "Estado", ancho: 12 },
    ];

    return { titulo: TITULOS.inventario, columnas, filas: data ?? [] };
  }

  private async reporteCompras(filtros: FiltrosReporte): Promise<DatosReporte> {
    let query = this.supabase
      .from("compras")
      .select("fecha, numero_factura, total, estado_pago, proveedores(nombre)")
      .order("fecha", { ascending: false });
    if (filtros.desde) query = query.gte("fecha", filtros.desde);
    if (filtros.hasta) query = query.lte("fecha", filtros.hasta);
    const { data, error } = await query;
    if (error) throw error;

    const columnas: ColumnaReporte[] = [
      { clave: "fecha", encabezado: "Fecha", ancho: 14, formato: "fecha" },
      { clave: "proveedor", encabezado: "Proveedor", ancho: 26 },
      { clave: "numero_factura", encabezado: "Factura", ancho: 14 },
      { clave: "total", encabezado: "Total", ancho: 14, formato: "moneda" },
      { clave: "estado_pago", encabezado: "Estado de pago", ancho: 16 },
    ];

    const filas = (data ?? []).map((c: any) => ({
      fecha: c.fecha,
      proveedor: c.proveedores?.nombre ?? "—",
      numero_factura: c.numero_factura ?? "—",
      total: c.total,
      estado_pago: c.estado_pago,
    }));

    return { titulo: TITULOS.compras, subtitulo: this.subtitulo(filtros), columnas, filas };
  }

  private async reporteProveedores(): Promise<DatosReporte> {
    const { data, error } = await this.supabase
      .from("proveedores")
      .select("nombre, empresa, telefono, whatsapp, ciudad, activo")
      .order("nombre");
    if (error) throw error;

    const columnas: ColumnaReporte[] = [
      { clave: "nombre", encabezado: "Nombre", ancho: 24 },
      { clave: "empresa", encabezado: "Empresa", ancho: 24 },
      { clave: "telefono", encabezado: "Teléfono", ancho: 16 },
      { clave: "whatsapp", encabezado: "WhatsApp", ancho: 16 },
      { clave: "ciudad", encabezado: "Ciudad", ancho: 16 },
      { clave: "activo", encabezado: "Activo", ancho: 10 },
    ];

    const filas = (data ?? []).map((p) => ({ ...p, activo: p.activo ? "Sí" : "No" }));
    return { titulo: TITULOS.proveedores, columnas, filas };
  }

  private async reporteEventos(filtros: FiltrosReporte): Promise<DatosReporte> {
    let query = this.supabase
      .from("eventos")
      .select("fecha, cliente_nombre, tematica, cantidad_ninos, cantidad_adultos, total_cobrado, estado_pago")
      .order("fecha", { ascending: false });
    if (filtros.desde) query = query.gte("fecha", filtros.desde);
    if (filtros.hasta) query = query.lte("fecha", filtros.hasta);
    const { data, error } = await query;
    if (error) throw error;

    const columnas: ColumnaReporte[] = [
      { clave: "fecha", encabezado: "Fecha", ancho: 14, formato: "fecha" },
      { clave: "cliente_nombre", encabezado: "Cliente", ancho: 24 },
      { clave: "tematica", encabezado: "Temática", ancho: 20 },
      { clave: "cantidad_ninos", encabezado: "Niños", ancho: 10 },
      { clave: "cantidad_adultos", encabezado: "Adultos", ancho: 10 },
      { clave: "total_cobrado", encabezado: "Total cobrado", ancho: 16, formato: "moneda" },
      { clave: "estado_pago", encabezado: "Estado de pago", ancho: 16 },
    ];

    return { titulo: TITULOS.eventos, subtitulo: this.subtitulo(filtros), columnas, filas: data ?? [] };
  }

  private async reporteIngresos(filtros: FiltrosReporte): Promise<DatosReporte> {
    let query = this.supabase
      .from("ingresos")
      .select("fecha, tipo, importe, medio_pago, eventos(cliente_nombre)")
      .order("fecha", { ascending: false });
    if (filtros.desde) query = query.gte("fecha", filtros.desde);
    if (filtros.hasta) query = query.lte("fecha", filtros.hasta);
    const { data, error } = await query;
    if (error) throw error;

    const columnas: ColumnaReporte[] = [
      { clave: "fecha", encabezado: "Fecha", ancho: 14, formato: "fecha" },
      { clave: "tipo", encabezado: "Tipo", ancho: 14 },
      { clave: "evento", encabezado: "Evento", ancho: 24 },
      { clave: "importe", encabezado: "Importe", ancho: 14, formato: "moneda" },
      { clave: "medio_pago", encabezado: "Medio de pago", ancho: 16 },
    ];

    const filas = (data ?? []).map((i: any) => ({
      fecha: i.fecha,
      tipo: i.tipo,
      evento: i.eventos?.cliente_nombre ?? "—",
      importe: i.importe,
      medio_pago: i.medio_pago ?? "—",
    }));

    return { titulo: TITULOS.ingresos, subtitulo: this.subtitulo(filtros), columnas, filas };
  }

  private async reporteGastos(filtros: FiltrosReporte): Promise<DatosReporte> {
    let query = this.supabase
      .from("gastos")
      .select("fecha, categoria, concepto, importe, medio_pago, proveedores(nombre)")
      .order("fecha", { ascending: false });
    if (filtros.desde) query = query.gte("fecha", filtros.desde);
    if (filtros.hasta) query = query.lte("fecha", filtros.hasta);
    const { data, error } = await query;
    if (error) throw error;

    const columnas: ColumnaReporte[] = [
      { clave: "fecha", encabezado: "Fecha", ancho: 14, formato: "fecha" },
      { clave: "categoria", encabezado: "Categoría", ancho: 16 },
      { clave: "concepto", encabezado: "Concepto", ancho: 28 },
      { clave: "proveedor", encabezado: "Proveedor", ancho: 20 },
      { clave: "importe", encabezado: "Importe", ancho: 14, formato: "moneda" },
    ];

    const filas = (data ?? []).map((g: any) => ({
      fecha: g.fecha,
      categoria: g.categoria,
      concepto: g.concepto,
      proveedor: g.proveedores?.nombre ?? "—",
      importe: g.importe,
    }));

    return { titulo: TITULOS.gastos, subtitulo: this.subtitulo(filtros), columnas, filas };
  }

  private async reporteBalance(): Promise<DatosReporte> {
    const { data, error } = await this.supabase.from("vw_evolucion_mensual").select("*");
    if (error) throw error;

    const columnas: ColumnaReporte[] = [
      { clave: "mes", encabezado: "Mes", ancho: 14, formato: "fecha" },
      { clave: "ingresos", encabezado: "Ingresos", ancho: 16, formato: "moneda" },
      { clave: "gastos", encabezado: "Gastos", ancho: 16, formato: "moneda" },
      { clave: "ganancia", encabezado: "Ganancia", ancho: 16, formato: "moneda" },
    ];

    return { titulo: TITULOS.balance, subtitulo: "Últimos 12 meses", columnas, filas: data ?? [] };
  }

  private async reporteProductosMasUtilizados(): Promise<DatosReporte> {
    const { data, error } = await this.supabase.from("vw_productos_mas_utilizados").select("*");
    if (error) throw error;

    const columnas: ColumnaReporte[] = [
      { clave: "nombre", encabezado: "Producto", ancho: 28 },
      { clave: "cantidad_total_consumida", encabezado: "Cantidad consumida", ancho: 18 },
      { clave: "cantidad_eventos", encabezado: "Cantidad de eventos", ancho: 18 },
    ];

    return { titulo: TITULOS["productos-mas-utilizados"], columnas, filas: data ?? [] };
  }

  private async reporteProductosMenosUtilizados(): Promise<DatosReporte> {
    const { data, error } = await this.supabase.from("vw_productos_menos_utilizados").select("*");
    if (error) throw error;

    const columnas: ColumnaReporte[] = [
      { clave: "nombre", encabezado: "Producto", ancho: 28 },
      { clave: "cantidad_total_consumida", encabezado: "Cantidad consumida", ancho: 20 },
    ];

    return { titulo: TITULOS["productos-menos-utilizados"], columnas, filas: data ?? [] };
  }

  private async reporteRentabilidad(filtros: FiltrosReporte): Promise<DatosReporte> {
    let query = this.supabase
      .from("vw_costo_promedio_evento")
      .select("*")
      .order("fecha", { ascending: false });
    if (filtros.desde) query = query.gte("fecha", filtros.desde);
    if (filtros.hasta) query = query.lte("fecha", filtros.hasta);
    const { data, error } = await query;
    if (error) throw error;

    const columnas: ColumnaReporte[] = [
      { clave: "fecha", encabezado: "Fecha", ancho: 14, formato: "fecha" },
      { clave: "costo_insumos", encabezado: "Costo insumos", ancho: 16, formato: "moneda" },
      { clave: "total_cobrado", encabezado: "Total cobrado", ancho: 16, formato: "moneda" },
      { clave: "margen", encabezado: "Margen", ancho: 16, formato: "moneda" },
    ];

    return { titulo: TITULOS.rentabilidad, subtitulo: this.subtitulo(filtros), columnas, filas: data ?? [] };
  }

  private async reporteEstadisticas(): Promise<DatosReporte> {
    const { data, error } = await this.supabase.from("vw_pronostico_reposicion").select("*");
    if (error) throw error;

    const columnas: ColumnaReporte[] = [
      { clave: "nombre", encabezado: "Producto", ancho: 26 },
      { clave: "promedio_dias_entre_compras", encabezado: "Frecuencia (días)", ancho: 16 },
      { clave: "ultima_compra", encabezado: "Última compra", ancho: 16, formato: "fecha" },
      { clave: "proxima_compra_estimada", encabezado: "Próxima compra estimada", ancho: 20, formato: "fecha" },
    ];

    return {
      titulo: TITULOS.estadisticas,
      subtitulo: "Pronóstico de reposición por producto",
      columnas,
      filas: data ?? [],
    };
  }
}
