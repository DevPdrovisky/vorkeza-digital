import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { supabaseServidor } from "@/lib/supabase/servidor";

/**
 * Destino do link mágico. Aceita os dois formatos do Supabase:
 *  - ?code=...                     (padrão PKCE: abrir no mesmo navegador que pediu o link)
 *  - ?token_hash=...&type=email    (modelo de e-mail personalizado: funciona em qualquer aparelho)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const destino = url.searchParams.get("next") ?? "/meus-dossies";
  const seguro = destino.startsWith("/") && !destino.startsWith("//") ? destino : "/meus-dossies";

  const supabase = await supabaseServidor();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const tipo = url.searchParams.get("type") as EmailOtpType | null;

  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && tipo) {
    ok = !(await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash })).error;
  }

  return NextResponse.redirect(new URL(ok ? seguro : "/entrar?erro=link", url.origin));
}
