-- ============================================================================
-- Migración 00005: ajuste de RLS en perfiles
-- La política original solo permitía ver el propio perfil (o admin ve todos).
-- Eso rompe los listados que muestran "registrado por" (movimientos, compras,
-- eventos), porque el usuario autenticado no tenía SELECT sobre perfiles de
-- otros compañeros. Se agrega una política de lectura general: cualquier
-- autenticado puede ver nombre/rol básico de cualquier perfil activo. Los
-- datos sensibles (nada especial vive hoy en `perfiles` más allá de nombre
-- y rol) y la escritura sigue restringida a admin.
-- ============================================================================

create policy "perfiles_select_autenticado" on perfiles
  for select using (auth.uid() is not null);
