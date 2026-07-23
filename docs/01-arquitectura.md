# Sistema de Gestión Integral — Colorín Colorado Infantiles
## Documento de Arquitectura de Software

---

## 1. Resumen Ejecutivo

Sistema web full stack para administrar un salón de eventos infantiles: inventario, compras, proveedores, gastos, ingresos, eventos (cumpleaños), estadísticas inteligentes, alertas y reportes. Diseñado para escalar de un solo salón a múltiples sedes sin reescritura mayor.

**Principios de diseño:**
- Arquitectura por capas con separación estricta de responsabilidades.
- Base de datos como fuente de verdad (constraints, triggers e integridad referencial en Postgres, no solo en la app).
- Seguridad a nivel de fila (Row Level Security) para roles Admin/Empleado.
- Cálculos derivados (estadísticas, proyecciones) resueltos en el backend mediante vistas y funciones SQL, nunca en el cliente.
- UI desacoplada de la lógica de negocio (hooks + servicios).

---

## 2. Stack Tecnológico

| Capa | Tecnología | Motivo |
|---|---|---|
| Frontend | Next.js 14 (App Router) + React 18 + TypeScript | SSR/ISR, rutas anidadas, server actions |
| Estilos | Tailwind CSS + shadcn/ui | Consistencia, theming claro/oscuro nativo |
| Gráficos | Recharts | Integración simple con React, suficiente para dashboards |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions) | Backend administrado, RLS nativo, realtime |
| Base de datos | PostgreSQL 15 | Relacional, soporta triggers/funciones/vistas materializadas |
| Autenticación | Supabase Auth (email/password + magic link opcional) | Integrado con RLS por `auth.uid()` |
| Reportes PDF | `@react-pdf/renderer` (server-side) | Generación de PDF sin dependencias del navegador |
| Reportes Excel | `exceljs` | Exportación tabular con formato |
| Validación | Zod (compartido cliente/servidor) | Un solo esquema de validación para formularios y API |
| Estado servidor | TanStack Query | Cache, revalidación, optimistic updates |
| Formularios | React Hook Form + Zod resolver | Performance y validación tipada |
| Testing | Vitest + Testing Library + Playwright (E2E) | Unit, integración y flujo completo |
| CI/CD | GitHub Actions → Vercel (frontend) + Supabase CLI (migraciones) | Despliegue continuo con migraciones versionadas |

---

## 3. Arquitectura General (capas)

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTACIÓN (Next.js App Router)                            │
│  app/(dashboard)/... páginas, layouts, componentes UI          │
├─────────────────────────────────────────────────────────────┤
│  CAPA DE APLICACIÓN                                            │
│  Server Actions + Route Handlers (app/api/*)                   │
│  - Validan input (Zod)                                         │
│  - Orquestan casos de uso                                      │
│  - No contienen SQL directo                                    │
├─────────────────────────────────────────────────────────────┤
│  CAPA DE DOMINIO / SERVICIOS                                   │
│  lib/services/*  (ej: comprasService, inventarioService)       │
│  - Reglas de negocio (ej: al registrar compra → sumar stock)   │
│  - Independiente de Next.js, testeable en aislamiento          │
├─────────────────────────────────────────────────────────────┤
│  CAPA DE ACCESO A DATOS (Repositorios)                         │
│  lib/repositories/*  (usan supabase-js tipado)                 │
│  - Un repositorio por entidad, sin lógica de negocio            │
├─────────────────────────────────────────────────────────────┤
│  SUPABASE (Postgres)                                            │
│  - Tablas + RLS + Triggers + Funciones + Vistas materializadas │
│  - Lógica crítica de integridad vive aquí (no confiar solo en  │
│    la app: si alguien pega directo a la DB, sigue siendo       │
│    consistente)                                                │
└─────────────────────────────────────────────────────────────┘
```

**Por qué repositorio + servicio separados:** permite testear reglas de negocio sin mockear Supabase, y cambiar de proveedor de datos en el futuro tocando solo una capa.

---

## 4. Estructura de Carpetas (Next.js)

```
salon-eventos/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                 # sidebar + topbar + buscador global
│   │   ├── dashboard/page.tsx
│   │   ├── proveedores/
│   │   │   ├── page.tsx               # listado + filtros
│   │   │   └── [id]/page.tsx          # ficha proveedor
│   │   ├── productos/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── compras/
│   │   │   ├── page.tsx
│   │   │   └── nueva/page.tsx
│   │   ├── inventario/
│   │   │   └── movimientos/page.tsx
│   │   ├── eventos/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx          # incluye consumo de productos
│   │   ├── gastos/page.tsx
│   │   ├── ingresos/page.tsx
│   │   ├── balance/page.tsx
│   │   ├── estadisticas/page.tsx
│   │   ├── alertas/page.tsx
│   │   ├── reportes/page.tsx
│   │   └── configuracion/
│   │       ├── usuarios/page.tsx      # solo admin
│   │       └── auditoria/page.tsx     # solo admin
│   ├── api/
│   │   ├── reportes/[tipo]/route.ts   # genera PDF/Excel
│   │   └── webhooks/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                            # shadcn primitives
│   ├── dashboard/
│   ├── forms/
│   ├── tables/                        # DataTable genérico con filtros
│   └── charts/
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # browser client
│   │   ├── server.ts                  # server client (cookies)
│   │   └── types.ts                   # tipos generados (supabase gen types)
│   ├── services/
│   │   ├── productos.service.ts
│   │   ├── compras.service.ts
│   │   ├── inventario.service.ts
│   │   ├── eventos.service.ts
│   │   ├── finanzas.service.ts
│   │   ├── estadisticas.service.ts
│   │   └── alertas.service.ts
│   ├── repositories/
│   │   ├── productos.repo.ts
│   │   ├── proveedores.repo.ts
│   │   ├── compras.repo.ts
│   │   ├── eventos.repo.ts
│   │   └── ...
│   ├── validators/                    # esquemas Zod
│   ├── reports/                       # generadores PDF/Excel
│   └── utils/
├── hooks/
│   ├── useProductos.ts
│   ├── useDashboardStats.ts
│   └── ...
├── supabase/
│   ├── migrations/                    # SQL versionado (nunca editar prod a mano)
│   └── seed.sql
├── middleware.ts                      # protección de rutas + roles
└── tests/
```

---

## 5. Flujo de Navegación

```
Login ──► Dashboard (según rol)
              │
   ┌──────────┼────────────────────────────────────────┐
   ▼          ▼             ▼             ▼             ▼
Proveedores  Productos    Compras      Inventario     Eventos
   │            │            │             │              │
   └─ficha      └─historial  └─registrar   └─movimientos   └─consumo
                              (↑ actualiza    (auditados)    (↓ descuenta
                               stock)                         stock)

Gastos + Ingresos ──► Balance ──► Estadísticas Inteligentes ──► Alertas
                                                                    │
                                                              Reportes (PDF/Excel)
```

Reglas de navegación por rol:
- **Administrador:** acceso total, incluye Configuración/Usuarios y Auditoría.
- **Empleado:** acceso a operación diaria (Eventos, Compras, Inventario) sin ver Balance/Rentabilidad ni gestionar usuarios (configurable por permiso, ver sección 7).

---

## 6. Patrones de Diseño Aplicados

| Patrón | Dónde | Para qué |
|---|---|---|
| Repository | `lib/repositories` | Aislar acceso a Supabase |
| Service Layer | `lib/services` | Reglas de negocio testeables |
| Server Actions | `app/**/actions.ts` | Mutaciones sin exponer API pública innecesaria |
| Optimistic UI | TanStack Query mutations | UX fluida en altas/bajas rápidas |
| Strategy | Generadores de reportes (`PdfReportStrategy`, `ExcelReportStrategy`) | Mismo caso de uso, distinto formato de salida |
| Observer (vía Postgres triggers + Supabase Realtime) | Alertas de stock bajo | Reacción automática a cambios de inventario |
| CQRS ligero | Vistas materializadas para estadísticas vs. tablas transaccionales | Separar lectura pesada (dashboards) de escritura frecuente |

---

## 7. Seguridad y Roles

- **Autenticación:** Supabase Auth. Tabla `perfiles` extiende `auth.users` con `rol` y metadatos.
- **Roles base:** `admin`, `empleado`. Extensible a `permisos` granulares (tabla `permisos_usuario`) si el negocio crece a más roles.
- **RLS:** cada tabla de negocio tiene políticas que verifican `auth.uid()` contra `perfiles.rol`; el empleado puede INSERT en compras/eventos/movimientos pero no DELETE, y no tiene SELECT en `gastos`/`ingresos`/vistas de rentabilidad.
- **Auditoría:** trigger genérico (`fn_registrar_auditoria`) en tablas críticas que escribe en `auditoria` (usuario, acción, tabla, registro, valores antes/después, timestamp).
- **Backups:** point-in-time recovery de Supabase (plan Pro) + export automatizado semanal a Storage como resguardo adicional.
- **Validación:** Zod en cliente y servidor (mismo esquema compartido) + `CHECK` constraints en Postgres como última línea de defensa.

---

## 8. Fases de Desarrollo (orden de ejecución)

1. ✅ Arquitectura (este documento)
2. ✅ Modelo de datos completo + diagrama ER (siguiente entrega)
3. Migraciones SQL: tablas, constraints, índices, triggers, RLS
4. Funciones/vistas para estadísticas y alertas
5. Setup de Next.js + Supabase client + autenticación + middleware de roles
6. CRUD backend (server actions) por módulo, en este orden: Productos → Proveedores → Compras → Inventario → Eventos → Gastos/Ingresos
7. Frontend: layout + dashboard + tablas con filtros + formularios por módulo
8. Estadísticas inteligentes y proyecciones
9. Sistema de alertas (realtime + panel)
10. Reportes PDF/Excel
11. Testing (unit, integración, E2E) y hardening de RLS
12. Deploy (Vercel + Supabase producción) y backups automatizados

Cada fase se entrega de forma incremental y revisable antes de avanzar a la siguiente, tal como pediste.
