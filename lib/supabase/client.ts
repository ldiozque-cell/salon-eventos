import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "./config";
import type { Database } from "./types";

/**
 * Cliente de Supabase para usar en Client Components ("use client").
 * Usa las cookies del navegador para mantener la sesión sincronizada
 * con el servidor (ver server.ts y middleware.ts).
 */
export function createClient() {
  return createBrowserClient<any>(getSupabaseUrl(), getSupabaseAnonKey());
}
