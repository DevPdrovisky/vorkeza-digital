import { demoPagamento, stripeConfigurado, urlDoSite } from "@/lib/ambiente";
import { PRODUTO } from "@/lib/config";
import { erroJson, falhaInterna } from "@/lib/http";
import { PREFIXO_DEMO } from "@/lib/pagamento";
import { repositorio } from "@/lib/repositorio";
import { stripe } from "@/lib/stripe";

/** Cria a sessão do Stripe Checkout (R$ 29,90, pagamento único) e devolve a URL de pagamento. */
export async function POST(req: Request) {
  const corpo = await req.json().catch(() => null);
  const dossieId = typeof corpo?.dossieId === "string" ? corpo.dossieId : null;
  if (!dossieId) return erroJson(400, "Dossiê não informado.");

  try {
    const repo = repositorio();
    const dossie = await repo.buscar(dossieId);
    if (!dossie) return erroJson(404, "Dossiê não encontrado.");

    const site = urlDoSite(req);
    if (dossie.status === "pago") return Response.json({ url: `${site}/dossie/${dossie.id}` });

    // Desenvolvimento sem chave da Stripe: simula o pagamento para testar o fluxo inteiro.
    if (!stripeConfigurado()) {
      if (!demoPagamento()) throw new Error("Stripe não configurado. Preencha STRIPE_SECRET_KEY.");
      const sessionId = `${PREFIXO_DEMO}${dossie.id}`;
      await repo.marcarPago(dossie.id, { sessionId, paymentIntent: null, emailPagador: null, valorCentavos: PRODUTO.precoCentavos });
      return Response.json({ url: `${site}/sucesso?session_id=${sessionId}`, demonstracao: true });
    }

    const sessao = await stripe().checkout.sessions.create({
      mode: "payment",
      locale: "pt-BR",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: PRODUTO.moeda,
            unit_amount: PRODUTO.precoCentavos,
            product_data: {
              name: `${PRODUTO.documento} (PDF)`,
              description: `Dossiê de ${dossie.nome} — ${PRODUTO.nome}. Pagamento único.`,
            },
          },
        },
      ],
      customer_email: dossie.email,
      client_reference_id: dossie.id,
      metadata: { dossie_id: dossie.id, codigo: dossie.codigo },
      payment_intent_data: { metadata: { dossie_id: dossie.id } },
      success_url: `${site}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/dossie/${dossie.id}?cancelado=1`,
    });

    await repo.registrarSessao(dossie.id, sessao.id);
    if (!sessao.url) throw new Error("A Stripe não devolveu a URL do Checkout.");
    return Response.json({ url: sessao.url });
  } catch (e) {
    return falhaInterna("api/checkout", e);
  }
}
