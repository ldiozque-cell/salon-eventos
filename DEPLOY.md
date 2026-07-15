# Guía de despliegue — Salón de Eventos

Checklist completo para pasar de "código en la compu" a "app funcionando
en internet". Pensada para alguien que nunca desplegó nada: cada paso
tiene el porqué, no solo el comando.

Tiempo estimado: 20-30 minutos.

---

## Paso 0 — Qué vas a necesitar

- Una cuenta de [GitHub](https://github.com) (gratis).
- Una cuenta de [Supabase](https://supabase.com) (gratis para este tamaño).
- Una cuenta de [Vercel](https://vercel.com) (gratis, se puede loguear con GitHub).
- Node.js instalado en tu computadora (para probar localmente antes de
  desplegar). Verificalo con `node -v` en una terminal — necesitás v18 o
  superior.

---

## Paso 1 — Subir el código a GitHub

Esto es necesario porque Vercel despliega **desde un repositorio**, no
desde un zip.

1. Extraé el `salon-eventos.zip` que te compartí en una carpeta de tu compu.
2. Creá un repositorio nuevo y **vacío** en GitHub (sin README, sin
   `.gitignore` — lo tenés que crear vos abajo).
3. En una terminal, parado en la carpeta del proyecto:

```bash
cd salon-eventos
git init
```

4. Creá un archivo `.gitignore` en la raíz del proyecto con este contenido
   (importante: así no subís `node_modules` ni tus claves secretas):

```
node_modules/
.next/
.env.local
.env*.local
```

5. Conectá y subí el código:

```bash
git add .
git commit -m "Primera versión del sistema de gestión"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/salon-eventos.git
git push -u origin main
```

---

## Paso 2 — Crear el proyecto de Supabase (producción)

**Importante:** usá un proyecto de Supabase *distinto* al que uses para
probar en tu compu, si es que ya tenías uno. Mezclar datos de prueba con
datos reales del negocio es una fuente clásica de dolores de cabeza.

1. Entrá a [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**.
2. Elegí un nombre (ej: `salon-eventos-prod`), una contraseña fuerte para
   la base (guardala en un lugar seguro, la vas a necesitar poco pero es
   crítica), y la región más cercana a donde esté el salón.
3. Esperá 1-2 minutos a que el proyecto termine de crearse.

### Aplicar las migraciones (crear todas las tablas)

La forma más simple sin instalar nada extra:

1. En el dashboard de Supabase, andá a **SQL Editor** (ícono de rayo en el
   menú lateral).
2. Abrí cada archivo de `supabase/migrations/` **en orden** (00001 →
   00008) desde tu compu, copiá el contenido completo, pegalo en el SQL
   Editor y hacé clic en **Run**. Repetí para cada uno de los 8 archivos.
   - Si alguno da error, copiá el mensaje y avisame — es más fácil
     diagnosticarlo con el error exacto que adivinando.

### Crear tu primer usuario administrador

1. Andá a **Authentication → Users → Add user → Create new user**.
   Completá tu email y una contraseña. Anotá el **User UID** que se genera
   (es un UUID largo).
2. Volvé al **SQL Editor** y corré esto, reemplazando los valores:

```sql
insert into perfiles (id, nombre_completo, rol)
values ('PEGAR-EL-USER-UID-ACA', 'Tu Nombre', 'admin');
```

### Obtener las claves del proyecto

Andá a **Project Settings → API**. Vas a necesitar tres valores para el
paso siguiente:
- **Project URL**
- **anon public key**
- **service_role key** (marcada como secreta — no la compartas ni la
  subas a GitHub)

---

## Paso 3 — Probar localmente (opcional pero recomendado)

Antes de desplegar, es más fácil detectar problemas en tu compu:

```bash
npm install
cp .env.example .env.local
```

Editá `.env.local` y pegá los tres valores del paso anterior. Después:

```bash
npm run dev
```

Abrí `http://localhost:3000`, logueate con el usuario admin que creaste, y
fijate que el Dashboard cargue sin errores. Si algo falla acá, es mucho
más fácil de corregir antes de desplegar que después.

---

## Paso 4 — Desplegar en Vercel

1. Entrá a [vercel.com/new](https://vercel.com/new) y logueate con GitHub.
2. **Import Project** → elegí el repositorio `salon-eventos` que subiste
   en el Paso 1.
3. Vercel va a detectar automáticamente que es un proyecto Next.js — no
   hace falta tocar nada de la configuración de build.
4. Antes de hacer clic en Deploy, abrí **Environment Variables** y cargá
   las mismas tres variables de tu `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Hacé clic en **Deploy** y esperá 2-3 minutos.
6. Cuando termine, Vercel te da una URL (algo como
   `salon-eventos.vercel.app`) — esa es tu app, ya accesible desde
   cualquier compu, tablet o celular.

A partir de acá, **cada vez que hagas `git push` a `main`, Vercel
redespliega solo** con los cambios nuevos.

---

## Paso 5 — Verificación final

Con la URL de Vercel abierta:
- [ ] Podés loguearte con el usuario admin.
- [ ] El Dashboard carga (aunque esté vacío de datos todavía).
- [ ] Podés crear un producto de prueba y ver que aparece en el listado.
- [ ] Podés crear un proveedor de prueba.
- [ ] El modo oscuro/claro responde a la configuración del sistema
      operativo del dispositivo.
- [ ] Desde el celular, la app se ve usable (no cortada ni desbordada).

Si algo de esto falla, decime **qué paso falló y qué mensaje de error
viste** (aunque sea una captura de pantalla descripta en texto) y lo
resolvemos.

---

## Después del despliegue: buenas prácticas

- **Nunca** subas `.env.local` a GitHub (el `.gitignore` del Paso 1 ya lo
  previene).
- Creá los usuarios "empleado" del salón desde Supabase Auth + un insert
  en `perfiles` con `rol = 'empleado'`, igual que hiciste con el admin.
- Antes de cargar datos reales, considerá borrar los productos/proveedores
  de prueba que hayas creado en la Verificación final.
- Supabase hace backups automáticos en el plan gratuito con retención
  limitada; si el negocio ya está operando con esto, vale la pena evaluar
  el plan Pro para tener point-in-time recovery más largo.
