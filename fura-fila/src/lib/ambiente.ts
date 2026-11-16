// Leitura centralizada das variáveis de ambiente.

export const emDesenvolvimento = process.env.NODE_ENV !== "production";

export function supabaseConfigurado() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/** O login por link mágico só precisa da URL e da chave pública. */
export function loginConfigurado() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function stripeConfigurado() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Modo demonstração: só em desenvolvimento e só para o que não estiver configurado.
 * Sem Supabase, os dossiês ficam na memória do servidor; sem Stripe, o pagamento é simulado.
 * Em produção, a falta de configuração gera erro em vez de simular.
 */
export const demoBanco = () => emDesenvolvimento && !supabaseConfigurado();
export const demoPagamento = () => emDesenvolvimento && !stripeConfigurado();

/** URL pública do app, sem barra final. */
export function urlDoSite(req?: Request) {
  const configurada = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (configurada) return configurada;
  if (req) return new URL(req.url).origin;
  return "http://localhost:3000";
}

export const bucketComprovantes = () => process.env.SUPABASE_BUCKET_COMPROVANTES || "comprovantes";
