"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const INTERVALO = 2500;

/**
 * Exibida quando a pessoa volta da Stripe antes de o webhook confirmar o pagamento
 * (comum no Pix). Consulta o status até virar "pago" e então recarrega a página.
 */
export function AguardandoPagamento({ dossieId }: { dossieId: string }) {
  const router = useRouter();
  const [tentativas, setTentativas] = useState(0);

  useEffect(() => {
    let ativo = true;
    const relogio = window.setInterval(async () => {
      const resposta = await fetch(`/api/dossie/${dossieId}/status`, { cache: "no-store" }).catch(() => null);
      const json = await resposta?.json().catch(() => null);
      if (!ativo) return;
      setTentativas((n) => n + 1);
      if (json?.status === "pago") {
        window.clearInterval(relogio);
        router.refresh();
      }
    }, INTERVALO);
    return () => {
      ativo = false;
      window.clearInterval(relogio);
    };
  }, [dossieId, router]);

  const demorando = tentativas >= 12;

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16 text-center sm:px-6" role="status" aria-live="polite">
      <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-marca-600" aria-hidden="true" />
      <h1 className="mt-6 text-2xl font-bold text-tinta-900">Confirmando seu pagamento…</h1>
      <p className="mt-2 text-slate-600">
        Costuma levar poucos segundos. Pagamentos por Pix podem levar alguns minutos.
      </p>
      {demorando && (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Ainda aguardando a confirmação do banco. Pode fechar esta página: assim que o pagamento for confirmado,
          o dossiê fica disponível em{" "}
          <Link href={`/dossie/${dossieId}`} className="font-semibold underline">
            seu link
          </Link>{" "}
          e em <Link href="/meus-dossies" className="font-semibold underline">Meus dossiês</Link>.
        </p>
      )}
    </div>
  );
}
