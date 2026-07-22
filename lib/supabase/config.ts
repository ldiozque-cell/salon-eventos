export const DEFAULT_SUPABASE_URL = "https://ejgbdmvmxetewerbeguf.supabase.co";
export const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_mpXc2HQYTfEQsw4qHlbWDQ_o9wdFB-4";
export const DEFAULT_SUPABASE_SERVICE_ROLE_KEY = "";

export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? DEFAULT_SUPABASE_URL;
}

export function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? DEFAULT_SUPABASE_ANON_KEY;
}

export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
}
