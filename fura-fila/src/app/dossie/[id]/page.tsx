import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PainelLiberado } from "@/components/painel-liberado";
import { Paywall } from "@/components/paywall";
import { Carregando, PaginaCompra } from "@/components/site";
import { repositorio } from "@/lib/repositorio";

export const metadata: Metadata = { title: "Seu dossiê", robots: { index: false } };

/** Link permanente do dossiê: paywall enquanto não pago; download depois do pagamento. */
export default function PaginaDossie({ params, searchParams }: PageProps<"/dossie/[id]">) {
  return (
    <PaginaCompra>
      <Suspense fallback={<Carregando texto="Carregando seu dossiê…" />}>
        <Conteudo params={params} searchParams={searchParams} />
      </Suspense>
    </PaginaCompra>
  );
}

async function Conteudo({ params, searchParams }: Pick<PageProps<"/dossie/[id]">, "params" | "searchParams">) {
  const [{ id }, busca] = await Promise.all([params, searchParams]);
  const dossie = await repositorio().buscar(id);
  if (!dossie) notFound();

  if (dossie.status === "pago") return <PainelLiberado dossie={dossie} titulo="Seu dossiê está liberado" />;

  return (
    <Paywall
      dossieId={dossie.id}
      respostas={dossie.respostas}
      qtdComprovantes={dossie.comprovantes.length}
      cancelado={busca.cancelado === "1"}
    />
  );
}
