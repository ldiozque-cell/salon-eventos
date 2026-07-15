import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Cliente de Supabase para usar en Client Components ("use client").
 * Usa las cookies del navegador para mantener la sesión sincronizada
 * con el servidor (ver server.ts y middleware.ts).
 */
export function createClient() {
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
