-- ============================================================================
-- Migración 00003: vistas para el Dashboard (Módulo 1)
-- ============================================================================

-- Indicadores del mes en curso: eventos, ingresos, gastos y ganancia neta
create or replace view vw_dashboard_mes_actual as
select
  (select count(*) from eventos
    where date_trunc('month', fecha) = date_trunc('month', current_date)) as eventos_mes,
  (select coalesce(sum(importe), 0) from ingresos
    where date_trunc('month', fecha) = date_trunc('month', current_date)) as ingresos_mes,
  (select coalesce(sum(importe), 0) from gastos
    where date_trunc('month', fecha) = date_trunc('month', current_date)) as gastos_mes,
  (select coalesce(sum(importe), 0) from ingresos
    where date_trunc('month', fecha) = date_trunc('month', current_date))
  -
  (select coalesce(sum(importe), 0) from gastos
    where date_trunc('month', fecha) = date_trunc('month', current_date)) as ganancia_neta_mes;

-- Evolución mensual de ingresos vs gastos (últimos 12 meses)
create or replace view vw_evolucion_mensual as
select
  meses.mes,
  coalesce(i.total, 0) as ingresos,
  coalesce(g.total, 0) as gastos,
  coalesce(i.total, 0) - coalesce(g.total, 0) as ganancia
from (
  select date_trunc('month', current_date) - (n || ' months')::interval as mes
  from generate_series(0, 11) as n
) meses
left join (
  select date_trunc('month', fecha) as mes, sum(importe) as total
  from ingresos group by 1
) i on i.mes = meses.mes
left join (
  select date_trunc('month', fecha) as mes, sum(importe) as total
  from gastos group by 1
) g on g.mes = meses.mes
order by meses.mes;

-- Gastos por categoría del mes en curso (para gráfico de torta/barras)
create or replace view vw_gastos_categoria_mes_actual as
select categoria, coalesce(sum(importe), 0) as total
from gastos
where date_trunc('month', fecha) = date_trunc('month', current_date)
group by categoria
order by total desc;

-- Productos más utilizados (por cantidad consumida en eventos, histórico)
create or replace view vw_productos_mas_utilizados as
select
  p.id as producto_id,
  p.nombre,
  sum(ec.cantidad) as cantidad_total_consumida,
  count(distinct ec.evento_id) as cantidad_eventos
from evento_consumos ec
join productos p on p.id = ec.producto_id
group by p.id, p.nombre
order by cantidad_total_consumida desc
limit 10;

-- Proveedores con mayor volumen de compra (histórico)
create or replace view vw_proveedores_mayor_volumen as
select
  pr.id as proveedor_id,
  pr.nombre,
  coalesce(sum(c.total), 0) as total_comprado,
  count(c.id) as cantidad_compras
from proveedores pr
join compras c on c.proveedor_id = pr.id
group by pr.id, pr.nombre
order by total_comprado desc
limit 10;

-- Próximas compras sugeridas: productos activos con stock en el mínimo o por debajo
create or replace view vw_compras_sugeridas as
select
  id as producto_id,
  nombre,
  stock_actual,
  stock_minimo,
  stock_ideal,
  greatest(stock_ideal - stock_actual, 0) as cantidad_sugerida,
  proveedor_principal_id
from productos
where estado = 'activo' and stock_actual <= stock_minimo
order by (stock_actual - stock_minimo) asc;
