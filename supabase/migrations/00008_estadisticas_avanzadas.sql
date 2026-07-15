-- ============================================================================
-- Migración 00008: vistas del Módulo 11 (Estadísticas Inteligentes)
-- Reutiliza vw_frecuencia_compra_producto y vw_precio_promedio_por_proveedor
-- ya creadas en la migración inicial (02-schema.sql / 00001).
-- ============================================================================

-- Productos que más aumentaron de precio (último aumento vs. precio anterior)
create or replace view vw_productos_mayor_aumento as
select
  p.id as producto_id,
  p.nombre,
  p.precio_actual,
  h.precio_anterior,
  h.variacion_porcentual,
  h.fecha as fecha_aumento
from productos p
join lateral (
  select precio_anterior, variacion_porcentual, fecha
  from producto_precio_historial
  where producto_id = p.id
  order by fecha desc
  limit 1
) h on true
where h.variacion_porcentual > 0
order by h.variacion_porcentual desc
limit 15;

-- Productos con menos uso (consumo en eventos, entre los que sí se usaron
-- alguna vez). Los que nunca se usaron se listan aparte en
-- vw_productos_sin_movimiento para no mezclar "poco usado" con "nunca usado".
create or replace view vw_productos_menos_utilizados as
select
  p.id as producto_id,
  p.nombre,
  coalesce(sum(ec.cantidad), 0) as cantidad_total_consumida
from productos p
join evento_consumos ec on ec.producto_id = p.id
where p.estado = 'activo'
group by p.id, p.nombre
order by cantidad_total_consumida asc
limit 15;

-- Productos activos sin ningún movimiento de inventario registrado nunca
create or replace view vw_productos_sin_movimiento as
select p.id as producto_id, p.nombre, p.stock_actual, p.precio_actual, p.created_at
from productos p
left join movimientos_inventario m on m.producto_id = p.id
where p.estado = 'activo' and m.id is null
order by p.created_at asc;

-- Capital inmovilizado: valor de stock que no tuvo salida (venta/consumo)
-- en los últimos 90 días. Es una lectura más fina que el valor total del
-- inventario, útil para decidir si conviene promocionar/descontar algo.
create or replace view vw_capital_inmovilizado as
select
  p.id as producto_id,
  p.nombre,
  p.stock_actual,
  p.precio_actual,
  round(p.stock_actual * p.precio_actual, 2) as valor_inmovilizado,
  ultimo_consumo.fecha as ultimo_consumo_fecha
from productos p
left join lateral (
  select max(created_at) as fecha
  from movimientos_inventario m
  where m.producto_id = p.id and m.tipo = 'salida_evento'
) ultimo_consumo on true
where p.estado = 'activo'
  and p.stock_actual > 0
  and (ultimo_consumo.fecha is null or ultimo_consumo.fecha < now() - interval '90 days')
order by valor_inmovilizado desc;

-- Proveedor más conveniente y más caro por producto, comparando el precio
-- promedio pagado a cada proveedor (requiere al menos 2 proveedores con
-- historial de compra para ese producto para que la comparación tenga
-- sentido).
create or replace view vw_comparacion_proveedores_por_producto as
select
  producto_id,
  proveedor_id,
  precio_promedio,
  ultima_compra,
  rank() over (partition by producto_id order by precio_promedio asc) as ranking_mas_barato,
  rank() over (partition by producto_id order by precio_promedio desc) as ranking_mas_caro
from vw_precio_promedio_por_proveedor;

-- Proyección de gastos del próximo mes: promedio de los últimos 3 meses
create or replace view vw_proyeccion_gastos as
select round(avg(total), 2) as proyeccion_proximo_mes
from (
  select date_trunc('month', fecha) as mes, sum(importe) as total
  from gastos
  where fecha >= date_trunc('month', current_date) - interval '3 months'
    and fecha < date_trunc('month', current_date)
  group by 1
) ultimos_meses;

-- Proyección de compras del próximo mes: valorización de las compras
-- sugeridas actuales (stock por debajo del mínimo) a precio actual, más el
-- promedio histórico de compras mensuales como referencia de contexto.
create or replace view vw_proyeccion_compras as
select
  (select coalesce(round(sum(greatest(stock_ideal - stock_actual, 0) * precio_actual), 2), 0)
     from productos where estado = 'activo' and stock_actual <= stock_minimo) as valor_reposicion_inmediata,
  (select round(avg(total), 2) from (
     select date_trunc('month', fecha) as mes, sum(total) as total
     from compras
     where fecha >= date_trunc('month', current_date) - interval '3 months'
       and fecha < date_trunc('month', current_date)
     group by 1
   ) ultimos_meses) as promedio_compras_mensual;

-- Pronóstico de reposición: próxima fecha estimada de compra por producto,
-- basada en la frecuencia histórica ya calculada en vw_frecuencia_compra_producto
create or replace view vw_pronostico_reposicion as
select
  f.producto_id,
  p.nombre,
  f.cantidad_compras,
  round(f.promedio_dias_entre_compras, 0) as promedio_dias_entre_compras,
  ultima.fecha as ultima_compra,
  (ultima.fecha + (round(f.promedio_dias_entre_compras, 0) || ' days')::interval)::date as proxima_compra_estimada
from vw_frecuencia_compra_producto f
join productos p on p.id = f.producto_id
join lateral (
  select max(c.fecha) as fecha
  from compra_items ci
  join compras c on c.id = ci.compra_id
  where ci.producto_id = f.producto_id
) ultima on true
where f.cantidad_compras >= 2 and f.promedio_dias_entre_compras is not null
order by proxima_compra_estimada asc nulls last;
