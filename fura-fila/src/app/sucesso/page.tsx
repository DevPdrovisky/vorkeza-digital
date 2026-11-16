import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AguardandoPagamento } from "@/components/aguardando-pagamento";
import { PainelLiberado } from "@/components/painel-liberado";
import { Aviso, Carregando, PaginaCompra } from "@/components/site";
import { consultarSessao } from "@/lib/pagamento";
import { repositorio } from "@/lib/repositorio";

export const metadata: Metadata = { title: "Pagamento", robots: { index: false } };

/** Destino do Stripe Checkout após o pagamento (success_url). */
export default function PaginaSucesso({ searchParams }: PageProps<"/sucesso">) {
  return (
    <PaginaCompra>
      <Suspense fallback={<Carregando texto="Confirmando seu pagamento…" />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </PaginaCompra>
  );
}

function SemPagamento() {
  return (
    <Aviso titulo="Não encontramos este pagamento">
      Se você já pagou, seu dossiê está em{" "}
      <Link href="/meus-dossies" className="font-semibold text-marca-700 underline">
        Meus dossiês
      </Link>
      , com o e-mail que informou no formulário.
    </Aviso>
  );
}

async function Conteudo({ searchParams }: Pick<PageProps<"/sucesso">, "searchParams">) {
  const busca = await searchParams;
  const sessionId = typeof busca.session_id === "string" ? busca.session_id : "";
  if (!sessionId) return <SemPagamento />;

  // O webhook é quem libera o dossiê. Esta consulta à Stripe só cobre o caso de ele atrasar.
  const resultado = await consultarSessao(sessionId).catch((e) => {
    console.error("[sucesso] falha ao consultar a sessão", e);
    return null;
  });
  if (!resultado) return <SemPagamento />;

  const dossie = await repositorio().buscar(resultado.dossieId);
  if (!dossie) return <SemPagamento />;
  if (dossie.status !== "pago") return <AguardandoPagamento dossieId={dossie.id} />;

  return <PainelLiberado dossie={dossie} titulo="Pagamento confirmado!" />;
}
