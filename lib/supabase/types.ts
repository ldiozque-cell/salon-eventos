/**
 * Este archivo se genera normalmente con:
 *   npm run supabase:types
 * (requiere `supabase link` y SUPABASE_PROJECT_ID configurado)
 *
 * Mientras tanto, se define a mano el subconjunto de tablas que usan los
 * repositorios ya implementados (Productos, Proveedores, Compras), para que
 * el proyecto compile con tipado estricto de punta a punta.
 */

export type RolUsuario = "admin" | "empleado";
export type EstadoProducto = "activo" | "inactivo";
export type EstadoPago = "pendiente" | "parcial" | "pagado" | "cancelado";
export type FormaPago =
  | "efectivo"
  | "transferencia"
  | "tarjeta_debito"
  | "tarjeta_credito"
  | "mercado_pago"
  | "otro";

export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: {
          id: string;
          nombre_completo: string;
          rol: RolUsuario;
          telefono: string | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["perfiles"]["Row"]> & {
          id: string;
          nombre_completo: string;
        };
        Update: Partial<Database["public"]["Tables"]["perfiles"]["Row"]>;
      };

      categorias_producto: {
        Row: {
          id: string;
          nombre: string;
          categoria_padre_id: string | null;
        };
        Insert: { nombre: string; categoria_padre_id?: string | null };
        Update: Partial<Database["public"]["Tables"]["categorias_producto"]["Row"]>;
      };

      proveedores: {
        Row: {
          id: string;
          nombre: string;
          empresa: string | null;
          responsable: string | null;
          telefono: string | null;
          whatsapp: string | null;
          email: string | null;
          direccion: string | null;
          ciudad: string | null;
          observaciones: string | null;
          horarios_atencion: string | null;
          condiciones_pago: string | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["proveedores"]["Row"]> & {
          nombre: string;
        };
        Update: Partial<Database["public"]["Tables"]["proveedores"]["Row"]>;
      };

      productos: {
        Row: {
          id: string;
          codigo_interno: string;
          codigo_barras: string | null;
          nombre: string;
          categoria_id: string | null;
          subcategoria_id: string | null;
          marca: string | null;
          unidad_medida: string;
          presentacion: string | null;
          proveedor_principal_id: string | null;
          precio_actual: number;
          fecha_ultimo_aumento: string | null;
          stock_actual: number;
          stock_minimo: number;
          stock_ideal: number;
          ubicacion_fisica: string | null;
          imagen_url: string | null;
          estado: EstadoProducto;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["productos"]["Row"]> & {
          codigo_interno: string;
          nombre: string;
        };
        Update: Partial<Database["public"]["Tables"]["productos"]["Row"]>;
      };

      compras: {
        Row: {
          id: string;
          fecha: string;
          numero_factura: string | null;
          proveedor_id: string;
          subtotal: number;
          iva: number | null;
          total: number;
          forma_pago: FormaPago | null;
          estado_pago: EstadoPago;
          observaciones: string | null;
          registrado_por: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["compras"]["Row"]> & {
          proveedor_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["compras"]["Row"]>;
      };

      compra_items: {
        Row: {
          id: string;
          compra_id: string;
          producto_id: string;
          cantidad: number;
          precio_unitario: number;
          subtotal: number;
        };
        Insert: {
          compra_id: string;
          producto_id: string;
          cantidad: number;
          precio_unitario: number;
        };
        Update: Partial<Database["public"]["Tables"]["compra_items"]["Row"]>;
      };

      movimientos_inventario: {
        Row: {
          id: string;
          producto_id: string;
          tipo:
            | "entrada_compra"
            | "salida_evento"
            | "ajuste_positivo"
            | "ajuste_negativo"
            | "perdida"
            | "rotura"
            | "vencimiento";
          cantidad: number;
          stock_resultante: number;
          referencia_tabla: string | null;
          referencia_id: string | null;
          motivo: string | null;
          usuario_id: string | null;
          created_at: string;
        };
        Insert: {
          producto_id: string;
          tipo: Database["public"]["Tables"]["movimientos_inventario"]["Row"]["tipo"];
          cantidad: number;
          stock_resultante?: number;
          referencia_tabla?: string | null;
          referencia_id?: string | null;
          motivo?: string | null;
          usuario_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["movimientos_inventario"]["Row"]>;
      };

      eventos: {
        Row: {
          id: string;
          cliente_nombre: string;
          cliente_telefono: string | null;
          fecha: string;
          hora: string;
          cantidad_ninos: number;
          cantidad_adultos: number;
          tematica: string | null;
          salon: string | null;
          estado_pago: EstadoPago;
          total_cobrado: number;
          registrado_por: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["eventos"]["Row"]> & {
          cliente_nombre: string;
          fecha: string;
          hora: string;
        };
        Update: Partial<Database["public"]["Tables"]["eventos"]["Row"]>;
      };

      gastos: {
        Row: {
          id: string;
          fecha: string;
          categoria: string;
          proveedor_id: string | null;
          concepto: string;
          importe: number;
          medio_pago: FormaPago | null;
          observaciones: string | null;
          registrado_por: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["gastos"]["Row"]> & {
          categoria: string;
          concepto: string;
          importe: number;
        };
        Update: Partial<Database["public"]["Tables"]["gastos"]["Row"]>;
      };

      ingresos: {
        Row: {
          id: string;
          evento_id: string | null;
          tipo: string;
          fecha: string;
          importe: number;
          medio_pago: FormaPago | null;
          observaciones: string | null;
          registrado_por: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["ingresos"]["Row"]> & {
          tipo: string;
          importe: number;
        };
        Update: Partial<Database["public"]["Tables"]["ingresos"]["Row"]>;
      };

      alertas: {
        Row: {
          id: string;
          tipo:
            | "stock_minimo"
            | "producto_agotado"
            | "aumento_precio"
            | "reposicion_sugerida"
            | "proveedor_discontinuo"
            | "producto_vencido"
            | "pago_pendiente"
            | "evento_saldo_pendiente";
          severidad: "info" | "advertencia" | "critica";
          titulo: string;
          descripcion: string | null;
          producto_id: string | null;
          proveedor_id: string | null;
          evento_id: string | null;
          leida: boolean;
          resuelta: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["alertas"]["Row"]> & {
          tipo: Database["public"]["Tables"]["alertas"]["Row"]["tipo"];
          titulo: string;
        };
        Update: Partial<Database["public"]["Tables"]["alertas"]["Row"]>;
      };
    };

    Views: {
      vw_dashboard_mes_actual: {
        Row: {
          eventos_mes: number;
          ingresos_mes: number;
          gastos_mes: number;
          ganancia_neta_mes: number;
        };
      };
      vw_evolucion_mensual: {
        Row: { mes: string; ingresos: number; gastos: number; ganancia: number };
      };
      vw_gastos_categoria_mes_actual: {
        Row: { categoria: string; total: number };
      };
      vw_productos_mas_utilizados: {
        Row: {
          producto_id: string;
          nombre: string;
          cantidad_total_consumida: number;
          cantidad_eventos: number;
        };
      };
      vw_proveedores_mayor_volumen: {
        Row: { proveedor_id: string; nombre: string; total_comprado: number; cantidad_compras: number };
      };
      vw_compras_sugeridas: {
        Row: {
          producto_id: string;
          nombre: string;
          stock_actual: number;
          stock_minimo: number;
          stock_ideal: number;
          cantidad_sugerida: number;
          proveedor_principal_id: string | null;
        };
      };
      vw_valor_inventario: {
        Row: {
          valor_total_inventario: number;
          productos_agotados: number;
          productos_stock_bajo: number;
          productos_sin_movimiento: number;
        };
      };
      vw_balance_anual: {
        Row: {
          anio: number;
          ingresos: number;
          gastos: number;
          ganancia: number;
          margen_porcentual: number;
        };
      };
      vw_balance_comparacion_mensual: {
        Row: {
          ingresos_actual: number;
          ingresos_anterior: number;
          gastos_actual: number;
          gastos_anterior: number;
          ganancia_actual: number;
          ganancia_anterior: number;
          variacion_ingresos_pct: number;
          variacion_gastos_pct: number;
          variacion_ganancia_pct: number;
        };
      };
      vw_productos_mayor_aumento: {
        Row: {
          producto_id: string;
          nombre: string;
          precio_actual: number;
          precio_anterior: number;
          variacion_porcentual: number;
          fecha_aumento: string;
        };
      };
      vw_productos_menos_utilizados: {
        Row: { producto_id: string; nombre: string; cantidad_total_consumida: number };
      };
      vw_productos_sin_movimiento: {
        Row: { producto_id: string; nombre: string; stock_actual: number; precio_actual: number; created_at: string };
      };
      vw_capital_inmovilizado: {
        Row: {
          producto_id: string;
          nombre: string;
          stock_actual: number;
          precio_actual: number;
          valor_inmovilizado: number;
          ultimo_consumo_fecha: string | null;
        };
      };
      vw_frecuencia_compra_producto: {
        Row: { producto_id: string; cantidad_compras: number; promedio_dias_entre_compras: number | null };
      };
      vw_pronostico_reposicion: {
        Row: {
          producto_id: string;
          nombre: string;
          cantidad_compras: number;
          promedio_dias_entre_compras: number;
          ultima_compra: string;
          proxima_compra_estimada: string;
        };
      };
      vw_proyeccion_gastos: {
        Row: { proyeccion_proximo_mes: number };
      };
      vw_proyeccion_compras: {
        Row: { valor_reposicion_inmediata: number; promedio_compras_mensual: number };
      };
      vw_costo_promedio_evento: {
        Row: {
          evento_id: string;
          fecha: string;
          costo_insumos: number;
          total_cobrado: number;
          margen: number;
        };
      };
    };
  };
}
