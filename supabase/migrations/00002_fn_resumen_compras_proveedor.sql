-- ============================================================================
-- Migración 00002: función de resumen de compras por proveedor
-- Usada por ProveedoresRepository.resumenCompras()
-- ============================================================================

create or replace function fn_resumen_compras_proveedor(p_proveedor_id uuid)
returns table (
  total_comprado numeric,
  cantidad_compras bigint,
  ultima_compra date,
  promedio_mensual numeric
) as $$
  select
    coalesce(sum(total), 0) as total_comprado,
    count(*) as cantidad_compras,
    max(fecha) as ultima_compra,
    case
      when count(*) = 0 then 0
      else round(
        coalesce(sum(total), 0) /
        greatest(1, extract(month from age(max(fecha), min(fecha))) + 1),
        2
      )
    end as promedio_mensual
  from compras
  where proveedor_id = p_proveedor_id;
$$ language sql stable security definer;
