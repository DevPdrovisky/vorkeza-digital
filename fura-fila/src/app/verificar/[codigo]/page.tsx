import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Carregando, PaginaInterna } from "@/components/site";
import { botaoPrimario } from "@/components/ui/estilos";
import { IconeEscudo, IconeX } from "@/components/ui/icones";
import { normalizarCodigo } from "@/lib/codigo";
import { linkVitrineImovel } from "@/lib/config";
import { textoRenda, textoTempo } from "@/lib/dossie";
import { dataPorExtenso } from "@/lib/formatar";
import { repositorio } from "@/lib/repositorio";

export const metadata: Metadata = { title: "Verificação de autenticidade", robots: { index: false } };

/** Destino do QR Code do PDF. Também é a vitrine da Vitrine Imóvel para corretores e imobiliárias. */
export default function PaginaVerificacao({ params }: PageProps<"/verificar/[codigo]">) {
  return (
    <PaginaInterna>
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <Suspense fallback={<Carregando texto="Consultando o registro original…" />}>
          <Resultado params={params} />
        </Suspense>
        <ChamadaImobiliarias />
      </div>
    </PaginaInterna>
  );
}

async function Resultado({ params }: Pick<PageProps<"/verificar/[codigo]">, "params">) {
  const { codigo: bruto } = await params;
  const codigo = normalizarCodigo(decodeURIComponent(bruto));
  const dossie = codigo ? await repositorio().buscarPorCodigo(codigo) : null;

  if (!dossie || dossie.status !== "pago") {
    return (
      <div className="rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <IconeX className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-tinta-900">Documento não encontrado</h1>
        <p className="mt-2 text-slate-600">
          Não existe dossiê emitido com o código <strong className="font-mono">{codigo ?? decodeURIComponent(bruto)}</strong>.
          Confira se foi digitado corretamente.
        </p>
        <Link href="/verificar" className="mt-6 inline-block text-sm font-semibold text-marca-700 underline">
          Tentar outro código
        </Link>
      </div>
    );
  }

  const r = dossie.respostas;
  const linhas: [string, string][] = [
    ["Candidato", r.nome],
    ["Profissão", r.empresa ? `${r.profissao} · ${r.empresa}` : r.profissao],
    ["Tempo no trabalho", textoTempo(r.tempoEmpresa)],
    ["Renda mensal declarada", textoRenda(r.faixaRenda)],
    ["Comprovantes anexados", String(dossie.comprovantes.length)],
    ["Emitido em", dataPorExtenso(dossie.pagoEm ?? dossie.criadoEm)],
    ["Código", dossie.codigo],
  ];

  return (
    <div className="rounded-3xl border border-marca-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-marca-600 text-white">
          <IconeEscudo className="h-7 w-7" />
        </span>
        <div>
          <p className="text-sm font-semibold text-marca-700">Documento autêntico</p>
          <h1 className="text-2xl font-bold text-tinta-900">Dossiê do Inquilino emitido pela plataforma</h1>
        </div>
      </div>
      <dl className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200">
        {linhas.map(([rotulo, valor]) => (
          <div key={rotulo} className="flex flex-col gap-0.5 px-4 py-3 text-sm sm:flex-row sm:gap-4">
            <dt className="w-48 shrink-0 text-slate-500">{rotulo}</dt>
            <dd className="font-medium text-tinta-900">{valor}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        Estes são os dados registrados no momento da emissão, declarados pelo candidato. Se o PDF que você recebeu
        mostrar informações diferentes, ele foi alterado depois de emitido.
      </p>
    </div>
  );
}

function ChamadaImobiliarias() {
  return (
    <div className="mt-8 overflow-hidden rounded-3xl bg-tinta-900 p-6 text-white sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-marca-300">Para corretores e imobiliárias</p>
      <h2 className="mt-3 text-2xl font-extrabold tracking-tight">
        Receber candidatos organizados é bom. Receber mais candidatos é melhor.
      </h2>
      <p className="mt-3 text-slate-300">
        A Vitrine Imóvel cria o site da sua imobiliária com um link para cada imóvel, com foto e preço que aparecem
        no WhatsApp e um botão de interesse com a mensagem pronta.
      </p>
      <a
        href={linkVitrineImovel("verificacao")}
        target="_blank"
        rel="noopener"
        className={`${botaoPrimario} mt-6`}
      >
        Conhecer a Vitrine Imóvel
      </a>
    </div>
  );
}
