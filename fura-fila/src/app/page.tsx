import Link from "next/link";
import { DocumentoPreview } from "@/components/documento-preview";
import { CabecalhoSite, RodapeSite } from "@/components/site";
import { botaoPrimario } from "@/components/ui/estilos";
import {
  IconeCheck,
  IconeDocumento,
  IconeEnviar,
  IconeEscudo,
  IconeRelogio,
  IconeSeta,
  IconeX,
} from "@/components/ui/icones";
import { PRODUTO } from "@/lib/config";
import { RESPOSTAS_EXEMPLO } from "@/lib/exemplo";
import { brlCentavos } from "@/lib/formatar";
import { previewDasRespostas } from "@/lib/preview";

const PRECO = brlCentavos(PRODUTO.precoCentavos);

const PASSOS = [
  {
    titulo: "Responda em 3 minutos",
    texto: "Uma pergunta por tela: trabalho, renda, quem vai morar e sua última locação.",
    icone: IconeRelogio,
  },
  {
    titulo: `Libere por ${PRECO}`,
    texto: "Pagamento único e seguro. Sem assinatura, sem mensalidade.",
    icone: IconeEscudo,
  },
  {
    titulo: "Envie e saia na frente",
    texto: "Baixe o PDF e mande para o corretor junto com a primeira mensagem.",
    icone: IconeEnviar,
  },
];

const INCLUSO = [
  ["Resumo executivo", "Um parágrafo que apresenta você do jeito que o proprietário quer ler."],
  ["Capacidade de aluguel", "Calculada pela regra dos 30% da renda, a mesma que as imobiliárias usam."],
  ["Referência de locação", "Contato do seu último locador, pronto para ser consultado."],
  ["Comprovantes anexados", "Holerite, extrato ou IR no final do PDF, organizados como anexos."],
  ["Código de autenticidade", "QR Code para o proprietário conferir que o documento não foi alterado."],
  ["Design executivo", "Layout limpo, pronto para WhatsApp, e-mail ou impressão."],
];

const ANTES = [
  "Fotos tortas de documentos, uma por mensagem",
  "Áudio de dois minutos explicando a renda",
  "Informação pela metade e o corretor tendo que perguntar",
];

const DEPOIS = [
  "Um único PDF com tudo organizado",
  "Renda e aluguel compatível já calculados",
  "Referência com telefone e comprovantes anexos",
];

const PERGUNTAS = [
  [
    "O dossiê substitui a análise de crédito?",
    "Não. Ele organiza suas informações e comprovantes para o proprietário decidir mais rápido. A imobiliária pode continuar fazendo a análise dela: você só chega na frente, com tudo pronto.",
  ],
  [
    "O que acontece com os meus dados?",
    "Usamos suas respostas apenas para montar o dossiê. Os comprovantes ficam em armazenamento privado e só aparecem dentro do seu PDF.",
  ],
  [
    "Como funciona o pagamento?",
    `Pagamento único de ${PRECO}, processado pela Stripe, uma das maiores plataformas de pagamento do mundo. Não existe assinatura.`,
  ],
  [
    "Como o proprietário sabe que o documento é verdadeiro?",
    "Cada dossiê tem um código e um QR Code. Ao escanear, o proprietário vê o registro original emitido pela plataforma e confere se os dados batem.",
  ],
  [
    "Consigo baixar de novo depois?",
    "Sim. Pelo link da página de confirmação ou em “Meus dossiês”, entrando com o e-mail que você informou no formulário.",
  ],
];

export default function Home() {
  const exemplo = previewDasRespostas(RESPOSTAS_EXEMPLO, 1);

  return (
    <>
      <CabecalhoSite />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_60%_at_85%_10%,var(--color-marca-50),transparent_70%)]"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:pb-24 lg:pt-16">
            <div className="animate-surgir">
              <p className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                <span className="h-1.5 w-1.5 animate-pulsar rounded-full bg-amber-500" />
                Imóvel bom aluga em poucos dias. Quem manda tudo primeiro, leva.
              </p>
              <h1 className="mt-5 text-[2.35rem] font-extrabold leading-[1.06] tracking-tight text-tinta-900 sm:text-5xl lg:text-[3.5rem]">
                Seja o primeiro a ser aprovado.{" "}
                <span className="mt-2 block text-marca-600">Gere seu currículo de inquilino em 3 minutos.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                Responda algumas perguntas e receba o <strong className="font-semibold text-tinta-900">Dossiê do Inquilino</strong> em
                PDF, com renda, referências e comprovantes organizados do jeito que proprietários e imobiliárias
                gostam de receber.
              </p>
              <div className="mt-8 flex flex-col items-start gap-3">
                <Link href="/criar" className={`${botaoPrimario} w-full px-8 py-4 text-lg sm:w-auto`}>
                  Criar meu Dossiê Agora
                  <IconeSeta />
                </Link>
                <p className="text-sm text-slate-500">
                  <strong className="font-semibold text-slate-700">{PRECO}</strong> · pagamento único · sem cadastro
                </p>
              </div>
              <ul className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                {["Pronto em 3 minutos", "Código de autenticidade", "PDF pronto para WhatsApp"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-marca-50 text-marca-600">
                      <IconeCheck className="h-3 w-3" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mx-auto w-full max-w-md animate-surgir [animation-delay:150ms] lg:rotate-[1.5deg]">
              <DocumentoPreview dados={exemplo} etiqueta="Exemplo" />
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-sm font-bold uppercase tracking-[0.18em] text-marca-700">Como funciona</h2>
            <ol className="mt-8 grid gap-5 md:grid-cols-3">
              {PASSOS.map(({ titulo, texto, icone: Icone }, i) => (
                <li key={titulo} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tinta-900 text-white">
                      <Icone />
                    </span>
                    <span className="text-xs font-semibold text-slate-400">Passo {i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-tinta-900">{titulo}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ANTES x DEPOIS */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-tinta-900 sm:text-4xl">
              Para o proprietário, escolher inquilino é medir risco.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Quem entrega tudo organizado na primeira mensagem parece — e é — o candidato mais fácil de aprovar.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <p className="text-sm font-semibold text-slate-500">O que o corretor costuma receber</p>
              <ul className="mt-4 space-y-3">
                {ANTES.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-slate-600">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                      <IconeX className="h-3 w-3" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-marca-100 bg-marca-50 p-7">
              <p className="text-sm font-semibold text-marca-700">O que você vai mandar</p>
              <ul className="mt-4 space-y-3">
                {DEPOIS.map((t) => (
                  <li key={t} className="flex items-start gap-3 font-medium text-tinta-900">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-marca-600 text-white">
                      <IconeCheck className="h-3 w-3" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* O QUE VEM NO DOSSIÊ */}
        <section className="bg-tinta-900 text-white">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <h2 className="max-w-lg text-3xl font-extrabold tracking-tight sm:text-4xl">O que vai no seu dossiê</h2>
              <p className="max-w-md text-slate-300">Um documento com cara de análise profissional, montado a partir das suas respostas.</p>
            </div>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {INCLUSO.map(([titulo, texto]) => (
                <div key={titulo} className="bg-tinta-900 p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-marca-300">
                    <IconeDocumento />
                  </span>
                  <h3 className="mt-4 font-semibold">{titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">{texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PERGUNTAS */}
        <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-tinta-900">Perguntas frequentes</h2>
          <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {PERGUNTAS.map(([pergunta, resposta]) => (
              <details key={pergunta} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-tinta-900">
                  {pergunta}
                  <span className="text-xl leading-none text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{resposta}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-tinta-900 to-tinta-700 px-6 py-14 text-center text-white shadow-xl sm:px-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">O próximo imóvel bom vai ter fila.</h2>
            <p className="mx-auto mt-3 max-w-lg text-lg text-slate-300">
              Monte seu dossiê agora e mande antes dos outros candidatos.
            </p>
            <Link href="/criar" className={`${botaoPrimario} mt-8 px-8 py-4 text-lg`}>
              Criar meu Dossiê Agora
              <IconeSeta />
            </Link>
          </div>
        </section>
      </main>
      <RodapeSite />
    </>
  );
}
