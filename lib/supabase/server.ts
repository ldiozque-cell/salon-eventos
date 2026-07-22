import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from "./config";
import type { Database } from "./types";

/**
 * Cliente de Supabase para Server Components / Server Actions / Route Handlers.
 * Lee y escribe la sesión a través de las cookies de Next.js, para que
 * RLS (auth.uid()) funcione correctamente en cada request del servidor.
 *
 * IMPORTANTE: se crea uno nuevo por request (no es un singleton global),
 * porque cada request tiene su propio contexto de cookies.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<any>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Se ignora si se llama desde un Server Component (no puede escribir
            // cookies); el middleware se encarga de refrescar la sesión en ese caso.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Idem set().
          }
        },
      },
    }
  );
}

/**
 * Cliente con service_role para operaciones administrativas puntuales
 * (ej: scripts de mantenimiento, backups). NUNCA importar desde código
 * que corra en el cliente ni exponer esta key con NEXT_PUBLIC_.
 */
export function createAdminClient() {
  return createServerClient<any>(
    getSupabaseUrl(),
    getSupabaseServiceRoleKey(),
    { cookies: { get: () => undefined, set: () => {}, remove: () => {} } }
  );
}
