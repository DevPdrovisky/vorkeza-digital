"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Cliente do navegador: só usa a chave pública (anon/publishable). */
export function supabaseNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
