import { connection } from "next/server";
import { urlDoSite } from "@/lib/ambiente";
import { slug } from "@/lib/formatar";
import { erroJson, falhaInterna } from "@/lib/http";
import { repositorio } from "@/lib/repositorio";
import { gerarPdfDossie } from "@/pdf/gerar";

/** Gera o PDF na hora. Só libera depois que o pagamento foi confirmado. */
export async function GET(req: Request, ctx: RouteContext<"/api/dossie/[id]/pdf">) {
  await connection();
  const { id } = await ctx.params;

  try {
    const repo = repositorio();
    const dossie = await repo.buscar(id);
    if (!dossie) return erroJson(404, "Dossiê não encontrado.");
    if (dossie.status !== "pago") return erroJson(402, "Pagamento ainda não confirmado.");

    const anexos = await Promise.all(
      dossie.comprovantes.map(async (c) => ({
        nome: c.nome,
        tipo: c.tipo,
        bytes: await repo.baixarComprovante(c.caminho),
      })),
    );

    const pdf = await gerarPdfDossie({
      codigo: dossie.codigo,
      emitidoEm: dossie.pagoEm ?? dossie.criadoEm,
      aceiteEm: dossie.aceiteEm,
      respostas: dossie.respostas,
      anexos,
      baseUrl: urlDoSite(req),
    });

    const visualizar = new URL(req.url).searchParams.get("ver") === "1";
    const arquivo = `dossie-inquilino-${slug(dossie.nome) || "candidato"}.pdf`;
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${visualizar ? "inline" : "attachment"}; filename="${arquivo}"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (e) {
    return falhaInterna("api/pdf", e);
  }
}
