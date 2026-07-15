-- ============================================================================
-- Migración 00007: alertas automáticas adicionales para el Módulo 12
-- Ya existían (desde la migración inicial): stock_minimo, producto_agotado.
-- Se agregan acá: aumento_precio y pago_pendiente (compras).
--
-- Las alertas de "evento_saldo_pendiente" y "pago_pendiente" agregado no se
-- resuelven con un trigger porque dependen del paso del tiempo (ej: "el
-- evento es en 3 días y no está pagado"), no de un evento discreto de
-- inserción/update. Esas se calculan en vivo en el AlertasRepository al
-- leer la página, en vez de persistirse — ver lib/repositories/alertas.repo.ts.
-- ============================================================================

-- Alerta de aumento de precio significativo (>= 15%)
create or replace function fn_alerta_aumento_precio()
returns trigger as $$
declare
  v_nombre_producto text;
begin
  if new.variacion_porcentual >= 15 then
    select nombre into v_nombre_producto from productos where id = new.producto_id;

    insert into alertas (tipo, severidad, titulo, descripcion, producto_id)
    values (
      'aumento_precio',
      case when new.variacion_porcentual >= 30 then 'critica' else 'advertencia' end,
      'Aumento de precio: ' || coalesce(v_nombre_producto, 'producto'),
      format('El precio subió %s%% (de $%s a $%s)', new.variacion_porcentual, new.precio_anterior, new.precio_nuevo),
      new.producto_id
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_alerta_aumento_precio
  after insert on producto_precio_historial
  for each row execute function fn_alerta_aumento_precio();

-- Alerta de compra registrada con pago pendiente
create or replace function fn_alerta_compra_pago_pendiente()
returns trigger as $$
declare
  v_nombre_proveedor text;
begin
  if new.estado_pago = 'pendiente' then
    select nombre into v_nombre_proveedor from proveedores where id = new.proveedor_id;

    insert into alertas (tipo, severidad, titulo, descripcion, proveedor_id)
    values (
      'pago_pendiente',
      'advertencia',
      'Compra pendiente de pago: ' || coalesce(v_nombre_proveedor, 'proveedor'),
      format('Compra del %s por $%s', new.fecha, new.total),
      new.proveedor_id
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_alerta_compra_pago_pendiente
  after insert on compras
  for each row execute function fn_alerta_compra_pago_pendiente();
