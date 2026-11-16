import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cliente: SupabaseClient | null = null;

/**
 * Cliente com a chave service_role/secret: ignora o RLS.
 * Usado SOMENTE no servidor (rotas de API e Server Components). Nunca importe em componente "use client".
 */
export function supabaseAdmin() {
  if (!cliente) {
    cliente = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return cliente;
}
