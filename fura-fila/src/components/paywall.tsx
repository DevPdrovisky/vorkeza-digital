"use client";

import { useState } from "react";
import { DocumentoPreview } from "./documento-preview";
import { botaoPrimario } from "./ui/estilos";
import { IconeCadeado, IconeCheck } from "./ui/icones";
import { PRODUTO } from "@/lib/config";
import { textoCapacidade, type Respostas } from "@/lib/dossie";
import { brlCentavos, primeiroNome } from "@/lib/formatar";
import { previewDasRespostas } from "@/lib/preview";

export function Paywall({
  dossieId,
  respostas,
  qtdComprovantes,
  cancelado = false,
  falhasEnvio = 0,
}: {
  dossieId: string;
  respostas: Respostas;
  qtdComprovantes: number;
  cancelado?: boolean;
  falhasEnvio?: number;
}) {
  const [abrindo, setAbrindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function pagar() {
    setAbrindo(true);
    setErro(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossieId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.url) throw new Error(json.erro ?? "Não foi possível abrir o pagamento.");
      window.location.assign(json.url);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível abrir o pagamento.");
      setAbrindo(false);
    }
  }

  const itens = [
    "Resumo executivo e pontos fortes do seu perfil",
    `Aluguel compatível com a sua renda: ${textoCapacidade(respostas.faixaRenda)}`,
    respostas.referencia.primeiraLocacao
      ? "Vínculo profissional e contatos organizados"
      : `Referência de ${respostas.referencia.nome}, com telefone`,
    qtdComprovantes > 0
      ? `${qtdComprovantes === 1 ? "1 comprovante anexado" : `${qtdComprovantes} comprovantes anexados`} ao PDF`
      : "Código de autenticidade com QR Code",
    "PDF pronto para WhatsApp, e-mail e impressão",
  ];

  return (
    <div className="mx-auto grid w-full max-w-5xl animate-surgir items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-12">
      <div className="order-2 mx-auto w-full max-w-md lg:order-1">
        <DocumentoPreview dados={previewDasRespostas(respostas, qtdComprovantes)} bloqueado />
      </div>

      <div className="order-1 lg:order-2">
        {cancelado && (
          <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            O pagamento não foi concluído. Seu dossiê continua salvo: é só tentar de novo.
          </p>
        )}
        {falhasEnvio > 0 && (
          <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {falhasEnvio === 1 ? "Um comprovante não pôde ser enviado" : `${falhasEnvio} comprovantes não puderam ser enviados`}.
            O restante do dossiê está completo.
          </p>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-marca-50 px-3 py-1 text-xs font-semibold text-marca-700">
          <IconeCheck className="h-3.5 w-3.5" />
          Dossiê gerado com sucesso
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-tinta-900 sm:text-4xl">
          {primeiroNome(respostas.nome)}, seu dossiê está pronto.
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-slate-600">
          Libere o PDF completo e envie hoje mesmo para o proprietário ou a imobiliária, antes dos outros
          candidatos.
        </p>

        <ul className="mt-6 space-y-2.5">
          {itens.map((item) => (
            <li key={item} className="flex items-start gap-3 text-slate-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-marca-600 text-white">
                <IconeCheck className="h-3 w-3" />
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Pagamento único</p>
              <p className="text-4xl font-extrabold tracking-tight text-tinta-900">
                {brlCentavos(PRODUTO.precoCentavos)}
              </p>
            </div>
            <p className="text-right text-sm leading-snug text-slate-500">
              sem assinatura
              <br />
              acesso imediato
            </p>
          </div>
          <button type="button" onClick={pagar} disabled={abrindo} className={`${botaoPrimario} mt-5 w-full py-4 text-lg`}>
            {abrindo ? "Abrindo pagamento…" : "Desbloquear meu dossiê"}
          </button>
          {erro && (
            <p role="alert" className="mt-3 text-sm text-rose-600">
              {erro}
            </p>
          )}
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <IconeCadeado className="h-3.5 w-3.5" />
            Pagamento seguro processado pela Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
