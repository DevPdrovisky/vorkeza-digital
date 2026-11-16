import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente do usuário logado (link mágico), lido dos cookies da requisição.
 * Respeita o RLS: o usuário só enxerga os próprios dossiês pagos.
 * Crie um novo a cada requisição.
 */
export async function supabaseServidor() {
  const loja = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => loja.getAll(),
        setAll(lista) {
          try {
            lista.forEach(({ name, value, options }) => loja.set(name, value, options));
          } catch {
            // Server Components não podem gravar cookies; o proxy.ts renova a sessão.
          }
        },
      },
    },
  );
}
