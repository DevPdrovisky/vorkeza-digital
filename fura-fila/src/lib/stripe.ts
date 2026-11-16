import "server-only";
import Stripe from "stripe";

let cliente: Stripe | null = null;

export function stripe() {
  if (!cliente) {
    cliente = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      appInfo: { name: "fura-fila-de-alugueis" },
    });
  }
  return cliente;
}
