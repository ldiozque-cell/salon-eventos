# Salón de Eventos Infantiles — Sistema de Gestión

## Estado del proyecto
- ✅ Fase 1-2: Arquitectura y modelo de datos (`docs/`)
- ✅ Fase 3: Migraciones SQL (`supabase/migrations/`) — schema inicial + vistas
  de dashboard + función de ajustes de inventario + ajuste de RLS
- ✅ Fase 5: Setup Next.js + Supabase + autenticación + middleware de roles
- ✅ Fase 6: CRUD completo de **Productos**, **Proveedores**, **Compras**,
  **Inventario/Movimientos**, **Eventos** y **Gastos/Ingresos**
  (repositorio → servicio → server action → formulario → página)
- ✅ **Dashboard (Módulo 1) completo**: KPIs del mes, stock bajo/agotado,
  evolución mensual, gastos por categoría, compras sugeridas, últimos
  movimientos, compras recientes, productos más utilizados y proveedores
  con mayor volumen.
- ✅ **Eventos (Módulos 6-7)**: alta con consumo opcional de productos,
  detalle con costo de insumos/margen calculado en vivo, carga de consumo
  posterior (para el día del evento), listado de ingresos asociados.
- ✅ **Gastos e Ingresos (Módulos 8-9)**: alta y listado con filtros,
  restringidos a rol admin tanto en RLS como en la Server Action (doble
  validación, con mensaje claro en vez de error genérico de Postgres).
- ✅ **Balance (Módulo 10)**: comparación mes actual vs. mes anterior (con
  variación % de ingresos, gastos y ganancia), evolución mensual de 12
  meses (mismo gráfico que el Dashboard) y comparación anual con margen
  de rentabilidad por año.
- ✅ **Productos, Proveedores y Compras — ahora 100% completos**: páginas de
  alta (`/nuevo`), ficha/edición (`/[id]`), y en Compras además el listado
  (`/compras`) y cambio de estado de pago desde el detalle.
- ✅ **Alertas (Módulo 12) completo**: panel en `/alertas` con filtro por
  severidad/tipo, marcar como leída/resuelta, y badge con contador de
  alertas sin leer en el sidebar. Se ampliaron las alertas automáticas de
  la base (ahora también avisan de aumentos de precio ≥15% y compras con
  pago pendiente), y se agregó un bloque de "eventos con saldo pendiente
  próximos" calculado en vivo (no persistido, porque depende del paso del
  tiempo y no de un evento discreto).
- ✅ **Estadísticas inteligentes (Módulo 11) completo**: valor total del
  inventario, costo promedio por evento, proyección de gastos del próximo
  mes (promedio móvil de 3 meses), proyección de compras (valorización de
  reposición inmediata + promedio histórico), pronóstico de reposición por
  producto (próxima fecha de compra estimada según frecuencia histórica),
  productos que más aumentaron de precio, productos menos utilizados,
  productos sin ningún movimiento, y capital inmovilizado (stock sin
  consumo hace más de 90 días).
- ✅ **Reportes (Módulo 13) completo — cierra los 13 módulos del spec**:
  `/reportes` permite exportar en **PDF y Excel** los 11 tipos de reporte
  pedidos (inventario, compras, proveedores, eventos, ingresos, gastos,
  balance, productos más/menos utilizados, rentabilidad, estadísticas),
  con filtro por rango de fechas donde aplica. Los reportes financieros
  respetan la misma restricción de rol admin que el resto de la app.

## Los 13 módulos del spec original están funcionalmente completos.
Lo que queda es pulido de UX, testing y despliegue (ver "Próximo paso" abajo).

### Decisión de producto: vencimientos vía observaciones
El spec original sugería alertas de "productos vencidos". Se decidió **no**
agregar un campo `fecha_vencimiento` estructurado a `productos`: el control
de vencimientos se maneja de forma manual a través del campo
`observaciones` (tanto en `productos` como en los movimientos de tipo
`vencimiento`), y la baja de stock por vencimiento se sigue registrando
con el ajuste manual ya existente en `/inventario/movimientos`. Si más
adelante el negocio necesita alertas automáticas por fecha (no solo
registro post-hoc), ahí sí conviene sumar el campo estructurado — se deja
señalado pero fuera de alcance por ahora.

### Notas de diseño relevantes de esta iteración
- Los KPIs y gráficos del dashboard se resuelven 100% en **vistas SQL**
  (`vw_dashboard_mes_actual`, `vw_evolucion_mensual`, etc.), nunca calculados
  en el frontend, para que los números sean siempre consistentes.
- Los **ajustes manuales de inventario** (pérdida, rotura, vencimiento,
  ajuste +/-) se resuelven con una función RPC (`fn_registrar_ajuste_inventario`)
  que bloquea la fila del producto (`for update`) y actualiza stock +
  registra el movimiento en una sola transacción — mismo criterio de
  atomicidad que ya usan compras y consumo de eventos vía triggers.
- Se relajó la política RLS de `perfiles` para que cualquier usuario
  autenticado pueda leer nombre/rol de otros perfiles (necesario para
  mostrar "registrado por" en listados), manteniendo la escritura
  restringida a admin.
- **Eventos**: el consumo de productos es opcional al crear el evento
  (muchos salones cargan el consumo real recién el día del evento) y se
  puede agregar después desde la ficha del evento; cada carga descuenta
  stock automáticamente vía el trigger ya existente.
- **Gastos/Ingresos**: la restricción a rol admin se aplica en dos capas
  (RLS en Postgres + chequeo explícito en la Server Action) para que un
  empleado reciba un mensaje claro ("Solo un administrador puede...") en
  vez de un error crudo de permisos de base de datos.
- Los **ingresos por cancelación/reembolso** se cargan con importe
  negativo (validado por Zod con `.refine()`), así el total del Balance
  los resta automáticamente sin necesitar lógica especial en las sumas.

## Cómo correr el proyecto

**Para desplegar a producción (Vercel + Supabase), ver la guía paso a paso
en [`DEPLOY.md`](./DEPLOY.md).** Lo que sigue acá es para correrlo local.


1. Crear un proyecto en https://supabase.com
2. Copiar `.env.example` a `.env.local` y completar con los datos del proyecto
3. Aplicar las migraciones (con Supabase CLI):
   ```bash
   supabase link --project-ref <tu-project-id>
   supabase db push
   ```
4. Crear el primer usuario admin:
   - Alta en Supabase Auth (dashboard o `supabase.auth.admin.createUser`)
   - Insertar su fila en `perfiles` con `rol = 'admin'`
5. Instalar dependencias y correr en desarrollo:
   ```bash
   npm install
   npm run dev
   ```

## Estructura
Ver `docs/01-arquitectura.md` para el detalle completo de capas, carpetas y
patrones. Resumen rápido:

```
app/(auth)/login        → login
app/(dashboard)/...     → páginas protegidas (requieren sesión)
lib/repositories/       → acceso a datos (Supabase)
lib/services/           → reglas de negocio, validación
lib/validators/         → esquemas Zod compartidos
components/forms/       → formularios client-side
supabase/migrations/    → SQL versionado
```

## Próximo paso sugerido
Ya no quedan módulos funcionales del spec por construir. Lo que sigue es
"cerrar" el proyecto para producción:
1. **Búsqueda global funcional** (hoy es un input visual en el header sin
   lógica detrás) y **modo oscuro con toggle persistente** (hoy solo sigue
   la preferencia del sistema operativo, vía `dark:` de Tailwind).
2. **Testing**: unit tests de los servicios (reglas de negocio, cálculos),
   tests de integración de las Server Actions, y al menos un flujo E2E
   completo con Playwright (login → crear evento → consumir stock →
   verificar en dashboard).
3. **Backups automatizados** más allá del point-in-time recovery de
   Supabase (export semanal a Storage, mencionado en la arquitectura pero
   no implementado).
4. **Despliegue a producción**: conectar el repo a Vercel, cargar las
   variables de entorno, aplicar las 8 migraciones en el proyecto de
   Supabase de producción (no el mismo que desarrollo) y crear el primer
   usuario admin ahí.
5. Revisión de UX general: estados de carga (loading.tsx por ruta),
   páginas de error (error.tsx), y confirmaciones antes de bajas
   destructivas (hoy la baja de producto/proveedor es lógica, pero no
   pide confirmación en el frontend).
