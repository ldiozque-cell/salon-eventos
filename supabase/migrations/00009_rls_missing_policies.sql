-- ============================================================================
-- Migración 00009: Políticas RLS faltantes para UPDATE y DELETE
-- Problema: La aplicación usa el anon key de Supabase, pero muchas tablas
-- no tienen políticas DELETE/UPDATE, por lo que RLS bloquea silenciosamente
-- las operaciones de eliminación y edición.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PROVEEDORES: UPDATE y DELETE (admin)
-- ----------------------------------------------------------------------------
create policy "proveedores_update_admin" on proveedores
  for update using (fn_es_admin());

create policy "proveedores_delete_admin" on proveedores
  for delete using (fn_es_admin());

-- ----------------------------------------------------------------------------
-- EVENTOS: DELETE (admin) - UPDATE ya existe como eventos_update_operativo
-- ----------------------------------------------------------------------------
create policy "eventos_delete_admin" on eventos
  for delete using (fn_es_admin());

-- ----------------------------------------------------------------------------
-- EVENTO_CONSUMOS: DELETE y UPDATE (admin)
-- Necesario para poder corregir o eliminar consumos de un evento
-- ----------------------------------------------------------------------------
create policy "evento_consumos_delete_admin" on evento_consumos
  for delete using (fn_es_admin());

create policy "evento_consumos_update_admin" on evento_consumos
  for update using (fn_es_admin());

-- ----------------------------------------------------------------------------
-- GASTOS: UPDATE y DELETE (admin) - ya tiene SELECT e INSERT admin
-- ----------------------------------------------------------------------------
create policy "gastos_update_admin" on gastos
  for update using (fn_es_admin());

create policy "gastos_delete_admin" on gastos
  for delete using (fn_es_admin());

-- ----------------------------------------------------------------------------
-- INGRESOS: UPDATE y DELETE (admin) - ya tiene SELECT e INSERT admin
-- ----------------------------------------------------------------------------
create policy "ingresos_update_admin" on ingresos
  for update using (fn_es_admin());

create policy "ingresos_delete_admin" on ingresos
  for delete using (fn_es_admin());

-- ----------------------------------------------------------------------------
-- COMPRA_ITEMS: UPDATE y DELETE (admin)
-- Necesario para poder corregir o eliminar items de una compra
-- ----------------------------------------------------------------------------
create policy "compra_items_update_admin" on compra_items
  for update using (fn_es_admin());

create policy "compra_items_delete_admin" on compra_items
  for delete using (fn_es_admin());

-- ----------------------------------------------------------------------------
-- COMPRAS: UPDATE (admin) - DELETE ya existe como compras_delete_admin
-- ----------------------------------------------------------------------------
create policy "compras_update_admin" on compras
  for update using (fn_es_admin());

-- ----------------------------------------------------------------------------
-- ALERTAS: DELETE (admin) - ya tiene SELECT autenticado y UPDATE autenticado
-- ----------------------------------------------------------------------------
create policy "alertas_delete_admin" on alertas
  for delete using (fn_es_admin());

-- ----------------------------------------------------------------------------
-- AUDITORIA: UPDATE y DELETE (admin) - solo admin puede modificar registros
-- ----------------------------------------------------------------------------
create policy "auditoria_update_admin" on auditoria
  for update using (fn_es_admin());

create policy "auditoria_delete_admin" on auditoria
  for delete using (fn_es_admin());

-- ============================================================================
-- FIN DE MIGRACIÓN 00009
-- ============================================================================
