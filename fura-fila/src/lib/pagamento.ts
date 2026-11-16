import "server-only";
import type Stripe from "stripe";
import { demoPagamento } from "./ambiente";
import { repositorio } from "./repositorio";
import { stripe } from "./stripe";

export type ResultadoSessao = { dossieId: string; pago: boolean };

/**
 * Libera o dossiê se a sessão do Checkout estiver paga.
 * Chamado pelo webhook (fonte principal) e pela página de sucesso (rede de segurança,
 * caso o webhook atrase). Sempre com dados vindos da própria API da Stripe, nunca do navegador.
 */
export async function confirmarSessao(
  sessao: Stripe.Checkout.Session,
): Promise<ResultadoSessao | null> {
  const dossieId = sessao.metadata?.dossie_id || sessao.client_reference_id;
  if (!dossieId) return null;

  const pago = sessao.payment_status === "paid";
  if (pago) {
    await repositorio().marcarPago(dossieId, {
      sessionId: sessao.id,
      paymentIntent:
        typeof sessao.payment_intent === "string"
          ? sessao.payment_intent
          : (sessao.payment_intent?.id ?? null),
      emailPagador: sessao.customer_details?.email ?? null,
      valorCentavos: sessao.amount_total ?? null,
    });
  }
  return { dossieId, pago };
}

export const PREFIXO_DEMO = "demo_";

/** Consulta uma sessão pelo id que a Stripe devolve na URL de sucesso. */
export async function consultarSessao(sessionId: string): Promise<ResultadoSessao | null> {
  if (sessionId.startsWith(PREFIXO_DEMO)) {
    if (!demoPagamento()) return null;
    const dossie = await repositorio().buscar(sessionId.slice(PREFIXO_DEMO.length));
    return dossie ? { dossieId: dossie.id, pago: dossie.status === "pago" } : null;
  }
  const sessao = await stripe().checkout.sessions.retrieve(sessionId);
  return confirmarSessao(sessao);
}
