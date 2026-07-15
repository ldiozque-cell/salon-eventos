-- ============================================================================
-- SISTEMA DE GESTIÓN — SALÓN DE EVENTOS INFANTILES
-- Migración inicial: esquema completo
-- Motor: PostgreSQL 15 (Supabase)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- EXTENSIONES
-- ----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
create type rol_usuario as enum ('admin', 'empleado');

create type estado_producto as enum ('activo', 'inactivo');

create type tipo_movimiento_inventario as enum (
  'entrada_compra',
  'salida_evento',
  'ajuste_positivo',
  'ajuste_negativo',
  'perdida',
  'rotura',
  'vencimiento'
);

create type estado_pago as enum ('pendiente', 'parcial', 'pagado', 'cancelado');

create type forma_pago as enum ('efectivo', 'transferencia', 'tarjeta_debito', 'tarjeta_credito', 'mercado_pago', 'otro');

create type categoria_gasto as enum (
  'alimentos', 'bebidas', 'limpieza', 'decoracion', 'personal',
  'servicios', 'publicidad', 'reparaciones', 'impuestos', 'otros'
);

create type tipo_ingreso as enum ('reserva', 'sena', 'pago_final', 'extra', 'cancelacion', 'reembolso');

create type severidad_alerta as enum ('info', 'advertencia', 'critica');

create type tipo_alerta as enum (
  'stock_minimo', 'producto_agotado', 'aumento_precio',
  'reposicion_sugerida', 'proveedor_discontinuo', 'producto_vencido',
  'pago_pendiente', 'evento_saldo_pendiente'
);

-- ----------------------------------------------------------------------------
-- FUNCIÓN GENÉRICA: actualizar updated_at
-- ----------------------------------------------------------------------------
create or replace function fn_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- MÓDULO: USUARIOS / PERFILES
-- ============================================================================
create table perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_completo text not null,
  rol rol_usuario not null default 'empleado',
  telefono text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_perfiles_updated_at
  before update on perfiles
  for each row execute function fn_set_updated_at();

-- ============================================================================
-- MÓDULO: PROVEEDORES
-- ============================================================================
create table proveedores (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  empresa text,
  responsable text,
  telefono text,
  whatsapp text,
  email text,
  direccion text,
  ciudad text,
  observaciones text,
  horarios_atencion text,
  condiciones_pago text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_proveedores_updated_at
  before update on proveedores
  for each row execute function fn_set_updated_at();

create index idx_proveedores_nombre on proveedores using gin (to_tsvector('spanish', nombre));

-- ============================================================================
-- MÓDULO: PRODUCTOS
-- ============================================================================
create table categorias_producto (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null unique,
  categoria_padre_id uuid references categorias_producto(id) on delete set null
);

create table productos (
  id uuid primary key default uuid_generate_v4(),
  codigo_interno text not null unique,
  codigo_barras text unique,
  nombre text not null,
  categoria_id uuid references categorias_producto(id) on delete set null,
  subcategoria_id uuid references categorias_producto(id) on delete set null,
  marca text,
  unidad_medida text not null default 'unidad', -- unidad, kg, litro, paquete, etc.
  presentacion text,                             -- ej: "pack x6", "1L"
  proveedor_principal_id uuid references proveedores(id) on delete set null,
  precio_actual numeric(12,2) not null default 0 check (precio_actual >= 0),
  fecha_ultimo_aumento timestamptz,
  stock_actual numeric(12,2) not null default 0 check (stock_actual >= 0),
  stock_minimo numeric(12,2) not null default 0 check (stock_minimo >= 0),
  stock_ideal numeric(12,2) not null default 0 check (stock_ideal >= 0),
  ubicacion_fisica text,
  imagen_url text,
  estado estado_producto not null default 'activo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_productos_updated_at
  before update on productos
  for each row execute function fn_set_updated_at();

create index idx_productos_nombre on productos using gin (to_tsvector('spanish', nombre));
create index idx_productos_categoria on productos(categoria_id);
create index idx_productos_stock_bajo on productos(stock_actual, stock_minimo);

-- Proveedores alternativos por producto (N:N)
create table producto_proveedores (
  producto_id uuid not null references productos(id) on delete cascade,
  proveedor_id uuid not null references proveedores(id) on delete cascade,
  precio_ofrecido numeric(12,2),
  es_principal boolean not null default false,
  primary key (producto_id, proveedor_id)
);

-- Historial de precios (append-only, nunca se edita/borra)
create table producto_precio_historial (
  id uuid primary key default uuid_generate_v4(),
  producto_id uuid not null references productos(id) on delete cascade,
  precio_anterior numeric(12,2) not null,
  precio_nuevo numeric(12,2) not null,
  variacion_porcentual numeric(6,2) generated always as (
    case when precio_anterior = 0 then 0
    else round(((precio_nuevo - precio_anterior) / precio_anterior) * 100, 2) end
  ) stored,
  fecha timestamptz not null default now(),
  origen text -- 'compra', 'ajuste_manual'
);

create index idx_precio_historial_producto on producto_precio_historial(producto_id, fecha desc);

-- ============================================================================
-- MÓDULO: COMPRAS
-- ============================================================================
create table compras (
  id uuid primary key default uuid_generate_v4(),
  fecha date not null default current_date,
  numero_factura text,
  proveedor_id uuid not null references proveedores(id),
  subtotal numeric(12,2) not null default 0,
  iva numeric(12,2) default 0,
  total numeric(12,2) not null default 0,
  forma_pago forma_pago,
  estado_pago estado_pago not null default 'pendiente',
  observaciones text,
  registrado_por uuid references perfiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_compras_updated_at
  before update on compras
  for each row execute function fn_set_updated_at();

create table compra_items (
  id uuid primary key default uuid_generate_v4(),
  compra_id uuid not null references compras(id) on delete cascade,
  producto_id uuid not null references productos(id),
  cantidad numeric(12,2) not null check (cantidad > 0),
  precio_unitario numeric(12,2) not null check (precio_unitario >= 0),
  subtotal numeric(12,2) generated always as (cantidad * precio_unitario) stored
);

create index idx_compra_items_compra on compra_items(compra_id);
create index idx_compra_items_producto on compra_items(producto_id);
create index idx_compras_proveedor on compras(proveedor_id);
create index idx_compras_fecha on compras(fecha);

-- ============================================================================
-- MÓDULO: MOVIMIENTOS DE INVENTARIO (auditoría de todo cambio de stock)
-- ============================================================================
create table movimientos_inventario (
  id uuid primary key default uuid_generate_v4(),
  producto_id uuid not null references productos(id),
  tipo tipo_movimiento_inventario not null,
  cantidad numeric(12,2) not null,          -- positivo=entrada, negativo=salida (convención)
  stock_resultante numeric(12,2) not null,
  referencia_tabla text,                     -- 'compras' | 'eventos' | null (ajuste manual)
  referencia_id uuid,
  motivo text,
  usuario_id uuid references perfiles(id),
  created_at timestamptz not null default now()
);

create index idx_movimientos_producto on movimientos_inventario(producto_id, created_at desc);
create index idx_movimientos_tipo on movimientos_inventario(tipo);

-- ============================================================================
-- MÓDULO: EVENTOS (cumpleaños)
-- ============================================================================
create table eventos (
  id uuid primary key default uuid_generate_v4(),
  cliente_nombre text not null,
  cliente_telefono text,
  fecha date not null,
  hora time not null,
  cantidad_ninos integer not null default 0 check (cantidad_ninos >= 0),
  cantidad_adultos integer not null default 0 check (cantidad_adultos >= 0),
  tematica text,
  salon text,
  estado_pago estado_pago not null default 'pendiente',
  total_cobrado numeric(12,2) not null default 0,
  registrado_por uuid references perfiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_eventos_updated_at
  before update on eventos
  for each row execute function fn_set_updated_at();

create index idx_eventos_fecha on eventos(fecha);
create index idx_eventos_estado_pago on eventos(estado_pago);

-- Consumo de productos por evento (descuenta stock automáticamente vía trigger)
create table evento_consumos (
  id uuid primary key default uuid_generate_v4(),
  evento_id uuid not null references eventos(id) on delete cascade,
  producto_id uuid not null references productos(id),
  cantidad numeric(12,2) not null check (cantidad > 0),
  created_at timestamptz not null default now()
);

create index idx_evento_consumos_evento on evento_consumos(evento_id);
create index idx_evento_consumos_producto on evento_consumos(producto_id);

-- ============================================================================
-- MÓDULO: GASTOS
-- ============================================================================
create table gastos (
  id uuid primary key default uuid_generate_v4(),
  fecha date not null default current_date,
  categoria categoria_gasto not null,
  proveedor_id uuid references proveedores(id),
  concepto text not null,
  importe numeric(12,2) not null check (importe >= 0),
  medio_pago forma_pago,
  observaciones text,
  registrado_por uuid references perfiles(id),
  created_at timestamptz not null default now()
);

create index idx_gastos_fecha on gastos(fecha);
create index idx_gastos_categoria on gastos(categoria);

-- ============================================================================
-- MÓDULO: INGRESOS
-- ============================================================================
create table ingresos (
  id uuid primary key default uuid_generate_v4(),
  evento_id uuid references eventos(id) on delete set null,
  tipo tipo_ingreso not null,
  fecha date not null default current_date,
  importe numeric(12,2) not null,  -- puede ser negativo en 'reembolso'
  medio_pago forma_pago,
  observaciones text,
  registrado_por uuid references perfiles(id),
  created_at timestamptz not null default now()
);

create index idx_ingresos_fecha on ingresos(fecha);
create index idx_ingresos_evento on ingresos(evento_id);

-- ============================================================================
-- MÓDULO: ALERTAS
-- ============================================================================
create table alertas (
  id uuid primary key default uuid_generate_v4(),
  tipo tipo_alerta not null,
  severidad severidad_alerta not null default 'advertencia',
  titulo text not null,
  descripcion text,
  producto_id uuid references productos(id) on delete cascade,
  proveedor_id uuid references proveedores(id) on delete cascade,
  evento_id uuid references eventos(id) on delete cascade,
  leida boolean not null default false,
  resuelta boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_alertas_no_resueltas on alertas(resuelta, created_at desc);

-- ============================================================================
-- AUDITORÍA GENÉRICA
-- ============================================================================
create table auditoria (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid references perfiles(id),
  accion text not null,          -- 'INSERT' | 'UPDATE' | 'DELETE'
  tabla text not null,
  registro_id uuid,
  valores_anteriores jsonb,
  valores_nuevos jsonb,
  created_at timestamptz not null default now()
);

create index idx_auditoria_tabla on auditoria(tabla, created_at desc);

create or replace function fn_registrar_auditoria()
returns trigger as $$
begin
  insert into auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, valores_nuevos)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    coalesce(new.id, old.id),
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('UPDATE','INSERT') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Aplicar auditoría a tablas críticas
create trigger trg_auditoria_productos after insert or update or delete on productos
  for each row execute function fn_registrar_auditoria();
create trigger trg_auditoria_compras after insert or update or delete on compras
  for each row execute function fn_registrar_auditoria();
create trigger trg_auditoria_eventos after insert or update or delete on eventos
  for each row execute function fn_registrar_auditoria();
create trigger trg_auditoria_gastos after insert or update or delete on gastos
  for each row execute function fn_registrar_auditoria();
create trigger trg_auditoria_ingresos after insert or update or delete on ingresos
  for each row execute function fn_registrar_auditoria();

-- ============================================================================
-- TRIGGERS DE NEGOCIO: actualización automática de stock
-- ============================================================================

-- 1) Al insertar un item de compra: suma stock, registra movimiento e historial de precio
create or replace function fn_compra_item_after_insert()
returns trigger as $$
declare
  v_precio_actual numeric(12,2);
  v_nuevo_stock numeric(12,2);
begin
  select precio_actual into v_precio_actual from productos where id = new.producto_id;

  update productos
    set stock_actual = stock_actual + new.cantidad,
        precio_actual = new.precio_unitario,
        fecha_ultimo_aumento = case when new.precio_unitario > v_precio_actual then now() else fecha_ultimo_aumento end
    where id = new.producto_id
    returning stock_actual into v_nuevo_stock;

  insert into movimientos_inventario (producto_id, tipo, cantidad, stock_resultante, referencia_tabla, referencia_id, motivo, usuario_id)
  values (new.producto_id, 'entrada_compra', new.cantidad, v_nuevo_stock, 'compras', new.compra_id, 'Ingreso por compra', auth.uid());

  if v_precio_actual is distinct from new.precio_unitario then
    insert into producto_precio_historial (producto_id, precio_anterior, precio_nuevo, origen)
    values (new.producto_id, coalesce(v_precio_actual, 0), new.precio_unitario, 'compra');
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_compra_item_after_insert
  after insert on compra_items
  for each row execute function fn_compra_item_after_insert();

-- 2) Al insertar un consumo de evento: descuenta stock y registra movimiento
create or replace function fn_evento_consumo_after_insert()
returns trigger as $$
declare
  v_stock_disponible numeric(12,2);
  v_nuevo_stock numeric(12,2);
begin
  select stock_actual into v_stock_disponible from productos where id = new.producto_id for update;

  if v_stock_disponible < new.cantidad then
    raise exception 'Stock insuficiente para el producto %: disponible %, solicitado %',
      new.producto_id, v_stock_disponible, new.cantidad;
  end if;

  update productos
    set stock_actual = stock_actual - new.cantidad
    where id = new.producto_id
    returning stock_actual into v_nuevo_stock;

  insert into movimientos_inventario (producto_id, tipo, cantidad, stock_resultante, referencia_tabla, referencia_id, motivo, usuario_id)
  values (new.producto_id, 'salida_evento', -new.cantidad, v_nuevo_stock, 'eventos', new.evento_id, 'Consumo en evento', auth.uid());

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_evento_consumo_after_insert
  after insert on evento_consumos
  for each row execute function fn_evento_consumo_after_insert();

-- 3) Alertas automáticas de stock (se dispara tras cualquier update de stock)
create or replace function fn_verificar_stock_producto()
returns trigger as $$
begin
  if new.stock_actual = 0 and (old.stock_actual is null or old.stock_actual != 0) then
    insert into alertas (tipo, severidad, titulo, descripcion, producto_id)
    values ('producto_agotado', 'critica', 'Producto agotado: ' || new.nombre,
            'El producto se ha quedado sin stock.', new.id);
  elsif new.stock_actual <= new.stock_minimo and new.stock_actual > 0
        and (old.stock_actual is null or old.stock_actual > old.stock_minimo) then
    insert into alertas (tipo, severidad, titulo, descripcion, producto_id)
    values ('stock_minimo', 'advertencia', 'Stock bajo: ' || new.nombre,
            'El stock alcanzó el mínimo configurado (' || new.stock_minimo || ').', new.id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_verificar_stock_producto
  after update of stock_actual on productos
  for each row execute function fn_verificar_stock_producto();

-- ============================================================================
-- VISTAS PARA ESTADÍSTICAS Y DASHBOARD
-- ============================================================================

-- Valor total del inventario (a precio actual) y capital inmovilizado
create or replace view vw_valor_inventario as
select
  coalesce(sum(stock_actual * precio_actual), 0) as valor_total_inventario,
  count(*) filter (where stock_actual = 0) as productos_agotados,
  count(*) filter (where stock_actual > 0 and stock_actual <= stock_minimo) as productos_stock_bajo,
  count(*) filter (where stock_actual = 0 or (last_movement.max_fecha is null)) as productos_sin_movimiento
from productos
left join lateral (
  select max(created_at) as max_fecha
  from movimientos_inventario m
  where m.producto_id = productos.id
) last_movement on true;

-- Balance mensual (ingresos, gastos, ganancia)
create or replace view vw_balance_mensual as
select
  date_trunc('month', fecha)::date as mes,
  coalesce(sum(importe) filter (where true), 0) as total_ingresos
from ingresos
group by 1
order by 1;

create or replace view vw_gastos_mensuales as
select
  date_trunc('month', fecha)::date as mes,
  categoria,
  sum(importe) as total
from gastos
group by 1, 2
order by 1;

-- Costo promedio por evento
create or replace view vw_costo_promedio_evento as
select
  e.id as evento_id,
  e.fecha,
  coalesce(sum(ec.cantidad * p.precio_actual), 0) as costo_insumos,
  e.total_cobrado,
  e.total_cobrado - coalesce(sum(ec.cantidad * p.precio_actual), 0) as margen
from eventos e
left join evento_consumos ec on ec.evento_id = e.id
left join productos p on p.id = ec.producto_id
group by e.id, e.fecha, e.total_cobrado;

-- Frecuencia de compra promedio por producto (días entre compras)
create or replace view vw_frecuencia_compra_producto as
select
  ci.producto_id,
  count(distinct c.id) as cantidad_compras,
  avg(dias_entre_compras) as promedio_dias_entre_compras
from compra_items ci
join compras c on c.id = ci.compra_id
cross join lateral (
  select extract(day from c.fecha - lag(c.fecha) over (partition by ci.producto_id order by c.fecha))::numeric as dias_entre_compras
) sub
group by ci.producto_id;

-- Proveedor más conveniente / más caro por producto (precio promedio ofrecido)
create or replace view vw_precio_promedio_por_proveedor as
select
  ci.producto_id,
  c.proveedor_id,
  avg(ci.precio_unitario) as precio_promedio,
  max(c.fecha) as ultima_compra
from compra_items ci
join compras c on c.id = ci.compra_id
group by ci.producto_id, c.proveedor_id;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table perfiles enable row level security;
alter table proveedores enable row level security;
alter table productos enable row level security;
alter table producto_proveedores enable row level security;
alter table producto_precio_historial enable row level security;
alter table compras enable row level security;
alter table compra_items enable row level security;
alter table movimientos_inventario enable row level security;
alter table eventos enable row level security;
alter table evento_consumos enable row level security;
alter table gastos enable row level security;
alter table ingresos enable row level security;
alter table alertas enable row level security;
alter table auditoria enable row level security;

-- Helper: verifica si el usuario autenticado es admin
create or replace function fn_es_admin()
returns boolean as $$
  select exists (
    select 1 from perfiles where id = auth.uid() and rol = 'admin' and activo = true
  );
$$ language sql security definer stable;

-- Perfiles: cada usuario ve el suyo; admin ve todos
create policy "perfiles_select_propio_o_admin" on perfiles
  for select using (id = auth.uid() or fn_es_admin());
create policy "perfiles_update_admin" on perfiles
  for update using (fn_es_admin());

-- Lectura general: cualquier usuario autenticado activo puede leer catálogos operativos
create policy "proveedores_select_autenticado" on proveedores for select using (auth.uid() is not null);
create policy "productos_select_autenticado" on productos for select using (auth.uid() is not null);
create policy "compras_select_autenticado" on compras for select using (auth.uid() is not null);
create policy "eventos_select_autenticado" on eventos for select using (auth.uid() is not null);
create policy "movimientos_select_autenticado" on movimientos_inventario for select using (auth.uid() is not null);
create policy "alertas_select_autenticado" on alertas for select using (auth.uid() is not null);

-- Escritura operativa: admin y empleado pueden insertar (operación diaria)
create policy "productos_insert_operativo" on productos for insert with check (auth.uid() is not null);
create policy "productos_update_operativo" on productos for update using (auth.uid() is not null);
create policy "productos_delete_admin" on productos for delete using (fn_es_admin());

create policy "compras_insert_operativo" on compras for insert with check (auth.uid() is not null);
create policy "compras_delete_admin" on compras for delete using (fn_es_admin());
create policy "compra_items_insert_operativo" on compra_items for insert with check (auth.uid() is not null);
create policy "compra_items_select_autenticado" on compra_items for select using (auth.uid() is not null);

create policy "eventos_insert_operativo" on eventos for insert with check (auth.uid() is not null);
create policy "eventos_update_operativo" on eventos for update using (auth.uid() is not null);
create policy "evento_consumos_insert_operativo" on evento_consumos for insert with check (auth.uid() is not null);
create policy "evento_consumos_select_autenticado" on evento_consumos for select using (auth.uid() is not null);

-- Financiero (gastos/ingresos/rentabilidad): solo admin
create policy "gastos_select_admin" on gastos for select using (fn_es_admin());
create policy "gastos_insert_admin" on gastos for insert with check (fn_es_admin());
create policy "ingresos_select_admin" on ingresos for select using (fn_es_admin());
create policy "ingresos_insert_admin" on ingresos for insert with check (fn_es_admin());

-- Auditoría: solo admin
create policy "auditoria_select_admin" on auditoria for select using (fn_es_admin());

-- Alertas: marcar como leída/resuelta cualquier autenticado
create policy "alertas_update_autenticado" on alertas for update using (auth.uid() is not null);

-- ============================================================================
-- FIN DE MIGRACIÓN INICIAL
-- ============================================================================
