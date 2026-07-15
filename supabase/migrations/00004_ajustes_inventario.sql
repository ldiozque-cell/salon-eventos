-- ============================================================================
-- Migración 00004: ajustes manuales de inventario (pérdida, rotura,
-- vencimiento, ajuste +/-). Se resuelve como función RPC para que la
-- actualización de stock + el registro del movimiento sean atómicos,
-- igual que ya lo son las compras y los consumos de eventos vía trigger.
-- ============================================================================

create or replace function fn_registrar_ajuste_inventario(
  p_producto_id uuid,
  p_tipo tipo_movimiento_inventario,
  p_cantidad numeric,
  p_motivo text
)
returns movimientos_inventario as $$
declare
  v_stock_actual numeric;
  v_nuevo_stock numeric;
  v_delta numeric;
  v_movimiento movimientos_inventario;
begin
  if p_tipo not in ('ajuste_positivo', 'ajuste_negativo', 'perdida', 'rotura', 'vencimiento') then
    raise exception 'Tipo de ajuste no permitido para carga manual: %', p_tipo;
  end if;

  if p_cantidad <= 0 then
    raise exception 'La cantidad del ajuste debe ser mayor a 0';
  end if;

  -- Bloquea la fila del producto hasta el commit para evitar carreras
  -- entre dos ajustes simultáneos sobre el mismo producto.
  select stock_actual into v_stock_actual from productos where id = p_producto_id for update;

  if v_stock_actual is null then
    raise exception 'Producto no encontrado: %', p_producto_id;
  end if;

  v_delta := case when p_tipo = 'ajuste_positivo' then p_cantidad else -p_cantidad end;

  if v_delta < 0 and v_stock_actual + v_delta < 0 then
    raise exception 'Stock insuficiente: disponible %, se intenta descontar %', v_stock_actual, p_cantidad;
  end if;

  update productos
    set stock_actual = stock_actual + v_delta
    where id = p_producto_id
    returning stock_actual into v_nuevo_stock;

  insert into movimientos_inventario (producto_id, tipo, cantidad, stock_resultante, motivo, usuario_id)
  values (p_producto_id, p_tipo, v_delta, v_nuevo_stock, p_motivo, auth.uid())
  returning * into v_movimiento;

  return v_movimiento;
end;
$$ language plpgsql security definer;
