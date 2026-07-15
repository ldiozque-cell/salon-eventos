-- ============================================================================
-- Migración 00006: vistas para el Módulo 10 (Balance)
-- ============================================================================

-- Balance anual: ingresos, gastos, ganancia y margen por año calendario
create or replace view vw_balance_anual as
select
  extract(year from meses.anio)::int as anio,
  coalesce(i.total, 0) as ingresos,
  coalesce(g.total, 0) as gastos,
  coalesce(i.total, 0) - coalesce(g.total, 0) as ganancia,
  case
    when coalesce(i.total, 0) = 0 then 0
    else round(((coalesce(i.total, 0) - coalesce(g.total, 0)) / i.total) * 100, 2)
  end as margen_porcentual
from (
  select date_trunc('year', current_date) - (n || ' years')::interval as anio
  from generate_series(0, 4) as n
) meses
left join (
  select date_trunc('year', fecha) as anio, sum(importe) as total
  from ingresos group by 1
) i on i.anio = meses.anio
left join (
  select date_trunc('year', fecha) as anio, sum(importe) as total
  from gastos group by 1
) g on g.anio = meses.anio
order by meses.anio;

-- Comparación mes actual vs mes anterior (variación %), para el KPI de
-- tendencia en el Balance. Se separa de vw_dashboard_mes_actual porque acá
-- además se necesita el dato del mes anterior para calcular la variación.
create or replace view vw_balance_comparacion_mensual as
with meses as (
  select
    (select coalesce(sum(importe), 0) from ingresos
      where date_trunc('month', fecha) = date_trunc('month', current_date)) as ingresos_actual,
    (select coalesce(sum(importe), 0) from ingresos
      where date_trunc('month', fecha) = date_trunc('month', current_date) - interval '1 month') as ingresos_anterior,
    (select coalesce(sum(importe), 0) from gastos
      where date_trunc('month', fecha) = date_trunc('month', current_date)) as gastos_actual,
    (select coalesce(sum(importe), 0) from gastos
      where date_trunc('month', fecha) = date_trunc('month', current_date) - interval '1 month') as gastos_anterior
)
select
  ingresos_actual,
  ingresos_anterior,
  gastos_actual,
  gastos_anterior,
  (ingresos_actual - gastos_actual) as ganancia_actual,
  (ingresos_anterior - gastos_anterior) as ganancia_anterior,
  case when ingresos_anterior = 0 then 0
    else round(((ingresos_actual - ingresos_anterior) / ingresos_anterior) * 100, 2) end as variacion_ingresos_pct,
  case when gastos_anterior = 0 then 0
    else round(((gastos_actual - gastos_anterior) / gastos_anterior) * 100, 2) end as variacion_gastos_pct,
  case when (ingresos_anterior - gastos_anterior) = 0 then 0
    else round(
      (((ingresos_actual - gastos_actual) - (ingresos_anterior - gastos_anterior))
       / abs(ingresos_anterior - gastos_anterior)) * 100, 2)
  end as variacion_ganancia_pct
from meses;
