# Próximos pasos — preparar la app para uso productivo

Este documento resume la ruta recomendada para dejar la app lista para producción: corregir la build, validar el funcionamiento y desplegarla en Vercel.

## Objetivo final
Dejar la app funcionando en un entorno real, con acceso a usuarios, datos del negocio y uso diario.

## 1. Verificar la build local
Ejecutar la build para encontrar errores reales de compilación:

```bash
npm run build
```

Si aparece algún error:
- leer el mensaje exacto,
- corregir la causa en el código,
- volver a ejecutar la build.

### Qué revisar si falla la build
- errores de TypeScript en server actions o páginas
- imports o rutas mal definidas
- problemas con datos nulos o tipos de Supabase
- errores de render en componentes del dashboard o formularios

## 2. Corregir los problemas hasta que compile
La idea es repetir este ciclo hasta que la build quede verde:

1. correr `npm run build`
2. leer el error
3. corregir la causa raíz
4. volver a correr la build

No conviene avanzar a Vercel si la app no compila localmente primero.

## 3. Probar la app localmente
Una vez que compile:

```bash
npm run dev
```

Verificar:
- login funciona
- se puede ingresar al dashboard
- crear productos, proveedores, eventos y compras
- registrar gastos e ingresos
- revisar alertas, balance y estadísticas
- verificar que no haya errores visibles en pantalla

## 4. Preparar variables de entorno para producción
En Vercel hay que cargar estas variables:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

IMPORTANTE:
- no subir `.env.local` a GitHub
- usar un proyecto de Supabase distinto al de desarrollo si es posible

## 5. Desplegar en Vercel
Pasos recomendados:

1. subir el proyecto a GitHub
2. crear un proyecto nuevo en Vercel
3. conectar el repositorio
4. cargar las variables de entorno
5. hacer deploy
6. probar la URL pública

## 6. Configurar el entorno productivo
Una vez publicada la app:
- crear el primer usuario admin en Supabase Auth
- insertar el perfil del admin en la tabla `perfiles`
- aplicar las migraciones en el proyecto de Supabase de producción
- validar que login, dashboard y CRUD funcionen en la URL real

## 7. Criterio de listo para uso productivo
La app está lista cuando:
- la build de producción termina correctamente
- el login funciona en Vercel
- el dashboard carga sin errores
- se pueden crear y listar registros reales
- los reportes funcionan
- los datos se guardan correctamente en Supabase

## Resumen rápido
```bash
npm install
npm run build
npm run dev
```

Y luego:
- desplegar en Vercel,
- configurar variables de entorno,
- probar con datos reales,
- dejarla operativa para uso diario.
