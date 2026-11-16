import type Stripe from "stripe";
import { stripeConfigurado } from "@/lib/ambiente";
import { confirmarSessao } from "@/lib/pagamento";
import { stripe } from "@/lib/stripe";

/**
 * Webhook da Stripe: é aqui que o pagamento é confirmado e o dossiê liberado.
 * Eventos a assinar no Dashboard:
 *   checkout.session.completed
 *   checkout.session.async_payment_succeeded   (Pix e outros meios assíncronos)
 *   checkout.session.async_payment_failed
 */
export async function POST(req: Request) {
  const segredo = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeConfigurado() || !segredo) {
    return new Response("Webhook não configurado", { status: 500 });
  }

  const assinatura = req.headers.get("stripe-signature");
  if (!assinatura) return new Response("Assinatura ausente", { status: 400 });

  // O corpo precisa ser lido CRU (texto) para a verificação da assinatura funcionar.
  const corpo = await req.text();
  let evento: Stripe.Event;
  try {
    evento = stripe().webhooks.constructEvent(corpo, assinatura, segredo);
  } catch (e) {
    console.warn("[webhook stripe] assinatura inválida", e);
    return new Response("Assinatura inválida", { status: 400 });
  }

  try {
    switch (evento.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const resultado = await confirmarSessao(evento.data.object as Stripe.Checkout.Session);
        console.info(`[webhook stripe] ${evento.type}`, resultado);
        break;
      }
      case "checkout.session.async_payment_failed":
        console.warn("[webhook stripe] pagamento assíncrono falhou", evento.data.object.id);
        break;
    }
  } catch (e) {
    // 500 faz a Stripe reenviar o evento depois.
    console.error("[webhook stripe] falha ao processar", e);
    return new Response("Falha ao processar", { status: 500 });
  }

  return Response.json({ recebido: true });
}
