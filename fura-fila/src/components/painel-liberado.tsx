import Link from "next/link";
import { BotaoCompartilhar } from "./botao-compartilhar";
import { botaoPrimario, botaoSecundario } from "./ui/estilos";
import { IconeBaixar, IconeCheck, IconeEscudo } from "./ui/icones";
import { primeiroNome, slug } from "@/lib/formatar";
import type { Dossie } from "@/lib/repositorio";

/** Tela com o dossiê liberado: baixar, visualizar, compartilhar e dicas de uso. */
export function PainelLiberado({ dossie, titulo }: { dossie: Dossie; titulo: string }) {
  const urlPdf = `/api/dossie/${dossie.id}/pdf`;
  const arquivo = `dossie-inquilino-${slug(dossie.nome) || "candidato"}.pdf`;

  return (
    <div className="mx-auto w-full max-w-2xl animate-surgir px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-marca-600 text-white shadow-lg shadow-marca-600/30">
          <IconeCheck className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-tinta-900">{titulo}</h1>
        <p className="mt-2 text-lg text-slate-600">
          {primeiroNome(dossie.nome)}, seu Dossiê do Inquilino está pronto para enviar.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href={urlPdf} download={arquivo} className={`${botaoPrimario} w-full sm:w-auto`}>
            <IconeBaixar />
            Baixar PDF
          </a>
          <a href={`${urlPdf}?ver=1`} target="_blank" rel="noopener" className={`${botaoSecundario} w-full sm:w-auto`}>
            Visualizar
          </a>
          <BotaoCompartilhar url={urlPdf} arquivo={arquivo} />
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-600">
          <IconeEscudo className="mt-0.5 h-5 w-5 shrink-0 text-marca-600" />
          <p>
            Código de autenticidade <strong className="font-semibold text-tinta-900">{dossie.codigo}</strong>. O
            proprietário confere o documento pelo QR Code do PDF ou na{" "}
            <Link href={`/verificar/${dossie.codigo}`} className="font-medium text-marca-700 underline underline-offset-2">
              página de verificação
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-bold text-tinta-900">Como usar para sair na frente</h2>
        <ol className="mt-4 space-y-3 text-slate-600">
          {[
            "Mande o PDF junto com a primeira mensagem para o corretor, antes mesmo de agendar a visita.",
            "Avise que o documento tem código de autenticidade: o corretor confere em segundos.",
            `Precisa de novo? Baixe quando quiser em “Meus dossiês”, entrando com ${dossie.email}.`,
          ].map((dica, i) => (
            <li key={dica} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tinta-900 text-xs font-bold text-white">
                {i + 1}
              </span>
              {dica}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
