# Salón de Eventos Infantiles — Sistema de Gestión

## Estado actual del proyecto
El proyecto quedó en un estado funcional para uso operativo local y para cerrar la parte de producción con un último ajuste de compilación.

### Qué ya está funcionando
- ✅ Autenticación con Supabase Auth y middleware de protección por rol.
- ✅ Login y acceso a rutas protegidas con roles admin/empleado.
- ✅ Dashboard con KPIs, gráficos y bloques de resumen del mes.
- ✅ Módulo de productos, proveedores, compras, inventario y movimientos.
- ✅ Módulo de eventos con consumo opcional de productos y detalle con costos/margen.
- ✅ Módulo de gastos e ingresos con validación por rol admin.
- ✅ Módulo de balance, alertas y estadísticas inteligentes.
- ✅ Módulo de reportes en PDF y Excel.
- ✅ Migraciones SQL aplicadas en Supabase (las 8 migraciones del proyecto).

### Estado de despliegue
- ✅ La guía de despliegue quedó documentada en [DEPLOY.md](./DEPLOY.md).
- ⚠️ La app ya está lista para pruebas y uso local, pero la build de producción aún muestra un problema puntual de tipado en una action del módulo de productos. El flujo funcional ya está avanzado, y ese ajuste es el último paso para dejar la publicación en Vercel 100% limpia.

## Stack
- Next.js 14
- React 18
- Tailwind CSS
- Supabase Auth + Postgres + RLS
- Zod para validaciones
- ExcelJS y @react-pdf/renderer para reportes

## Requisitos
- Node.js 18 o superior
- Cuenta en Supabase
- Cuenta en Vercel si vas a desplegarlo

## Cómo correrlo localmente
1. Crear un proyecto en Supabase.
2. Copiar [.env.example](./.env.example) a [.env.local](./.env.local) y completar:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
3. Aplicar las migraciones en Supabase.
4. Crear el primer usuario admin en Supabase Auth y agregar su fila en la tabla perfiles con rol admin.
5. Instalar dependencias y correr la app:

```bash
npm install
npm run dev
```

La app queda disponible en http://localhost:3000.

## Estructura del proyecto
- app/ → páginas, layouts y server actions
- components/ → formularios y componentes visuales
- lib/repositories/ → acceso a datos con Supabase
- lib/services/ → reglas de negocio y validación
- lib/validators/ → schemas de Zod
- supabase/migrations/ → SQL versionado
- docs/ → arquitectura, schema y diagramas

## Próximos pasos recomendados
1. Finalizar el ajuste de tipado pendiente para que la build de producción quede 100% verde.
2. Publicar en Vercel usando la guía de [DEPLOY.md](./DEPLOY.md).
3. Agregar testing automatizado y mejorar UX con estados de carga y manejo de errores visuales.
4. Dejar preparado el entorno de producción con un proyecto de Supabase distinto al de desarrollo.
