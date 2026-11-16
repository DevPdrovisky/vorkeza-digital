import { LIMITES } from "@/lib/config";
import { erroJson, falhaInterna } from "@/lib/http";
import { repositorio } from "@/lib/repositorio";

/** Descobre o tipo pelo conteúdo do arquivo (não confia na extensão nem no navegador). */
function tipoReal(b: Uint8Array) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return "application/pdf";
  return null;
}

function nomeSeguro(nome: string) {
  const base = nome.split(/[\\/]/).pop() ?? "comprovante";
  // remove caracteres de controle
  const limpo = base.replace(/[\u0000-\u001f\u007f"<>]/g, "").trim();
  return (limpo || "comprovante").slice(0, 80);
}

/** Recebe um comprovante por vez (foto já comprimida no navegador, ou PDF). */
export async function POST(req: Request, ctx: RouteContext<"/api/dossie/[id]/comprovantes">) {
  const { id } = await ctx.params;

  try {
    const repo = repositorio();
    const dossie = await repo.buscar(id);
    if (!dossie) return erroJson(404, "Dossiê não encontrado.");
    if (dossie.status !== "pendente") return erroJson(409, "Este dossiê já foi emitido.");
    if (dossie.comprovantes.length >= LIMITES.arquivos) {
      return erroJson(400, `Limite de ${LIMITES.arquivos} comprovantes por dossiê.`);
    }

    const form = await req.formData().catch(() => null);
    const arquivo = form?.get("arquivo");
    if (!(arquivo instanceof File)) return erroJson(400, "Nenhum arquivo enviado.");
    if (arquivo.size === 0) return erroJson(400, "Arquivo vazio.");
    if (arquivo.size > LIMITES.bytesPorArquivo) return erroJson(413, "Arquivo maior que 4 MB.");

    const bytes = new Uint8Array(await arquivo.arrayBuffer());
    const tipo = tipoReal(bytes);
    if (!tipo) return erroJson(415, "Formato não aceito. Envie JPG, PNG ou PDF.");

    const comprovante = await repo.adicionarComprovante(id, { nome: nomeSeguro(arquivo.name), tipo, bytes });
    return Response.json({ id: comprovante.id, nome: comprovante.nome }, { status: 201 });
  } catch (e) {
    return falhaInterna("api/comprovantes", e);
  }
}
