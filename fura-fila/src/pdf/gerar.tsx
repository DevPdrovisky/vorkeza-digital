import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { PDFDocument, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { LIMITES, PRODUTO } from "@/lib/config";
import type { Respostas } from "@/lib/dossie";
import { CAIXA_ANEXO, DossiePDF, type DadosDossiePDF, type PaginaAnexo } from "./DossiePDF";
import { registrarFontes } from "./fontes";

export type ArquivoAnexo = { nome: string; tipo: string; bytes: Uint8Array | null };

export type EntradaPDF = {
  codigo: string;
  emitidoEm: Date;
  aceiteEm: Date;
  respostas: Respostas;
  anexos: ArquivoAnexo[];
  /** URL pública do app, usada no QR Code e no link de verificação. */
  baseUrl: string;
};

type PaginaDePdf = { indiceAnexo: number; doc: PDFDocument; pagina: number };

/**
 * Gera o PDF final:
 * 1. o react-pdf desenha o dossiê e uma página por anexo (fotos já entram aqui);
 * 2. se houver comprovantes em PDF, o pdf-lib desenha cada página original dentro do espaço
 *    reservado — assim todas as páginas mantêm o mesmo cabeçalho e o rodapé B2B.
 */
export async function gerarPdfDossie(entrada: EntradaPDF): Promise<Uint8Array<ArrayBuffer>> {
  registrarFontes();

  const urlVerificacao = `${entrada.baseUrl}/verificar/${entrada.codigo}`;
  const qrCode = await QRCode.toDataURL(urlVerificacao, {
    margin: 0,
    width: 320,
    errorCorrectionLevel: "M",
    color: { dark: "#0B1F3A", light: "#FFFFFF" },
  });

  const paginasAnexo: PaginaAnexo[] = [];
  const paginasDePdf: PaginaDePdf[] = [];

  for (const [i, arquivo] of entrada.anexos.entries()) {
    const numero = i + 1;
    const base = { numero, nome: arquivo.nome };

    if (!arquivo.bytes) {
      paginasAnexo.push({ ...base, aviso: "Arquivo indisponível no momento da geração do dossiê." });
      continue;
    }

    if (arquivo.tipo === "application/pdf") {
      try {
        const doc = await PDFDocument.load(arquivo.bytes, { ignoreEncryption: true });
        if (doc.isEncrypted) throw new Error("PDF protegido por senha");
        const total = doc.getPageCount();
        const usadas = Math.min(total, LIMITES.paginasPorPdf);
        if (usadas === 0) throw new Error("PDF sem páginas");
        // Ensaio num documento descartável: páginas sem conteúdo ou corrompidas falham aqui,
        // viram aviso e não derrubam a geração do dossiê inteiro.
        // (o pdf-lib só incorpora de fato no save(), por isso ele entra no ensaio).
        const ensaio = await PDFDocument.create();
        await ensaio.embedPdf(doc, Array.from({ length: usadas }, (_, p) => p));
        await ensaio.save();
        for (let p = 0; p < usadas; p++) {
          paginasDePdf.push({ indiceAnexo: paginasAnexo.length, doc, pagina: p });
          paginasAnexo.push({
            ...base,
            reservada: true,
            parte: total > 1 ? `Página ${p + 1} de ${total}${total > usadas && p === usadas - 1 ? " (demais omitidas)" : ""}` : undefined,
          });
        }
      } catch {
        paginasAnexo.push({
          ...base,
          aviso: "Este PDF não pôde ser incorporado (arquivo protegido ou danificado). Solicite o original ao candidato.",
        });
      }
      continue;
    }

    paginasAnexo.push({
      ...base,
      imagem: { data: Buffer.from(arquivo.bytes), format: arquivo.tipo === "image/png" ? "png" : "jpg" },
    });
  }

  const dados: DadosDossiePDF = {
    codigo: entrada.codigo,
    emitidoEm: entrada.emitidoEm,
    aceiteEm: entrada.aceiteEm,
    respostas: entrada.respostas,
    comprovantes: entrada.anexos.map((a) => ({ nome: a.nome })),
    urlVerificacao,
    qrCode,
    anexos: paginasAnexo,
  };

  const desenhado = await renderToBuffer(<DossiePDF dados={dados} />);
  if (paginasDePdf.length === 0) return new Uint8Array(desenhado);

  const final = await PDFDocument.load(desenhado);
  const primeiraPaginaDeAnexo = final.getPageCount() - paginasAnexo.length;

  for (const item of paginasDePdf) {
    const [embutida] = await final.embedPdf(item.doc, [item.pagina]);
    const pagina = final.getPage(primeiraPaginaDeAnexo + item.indiceAnexo);
    const alturaPagina = pagina.getHeight();
    const escala = Math.min(CAIXA_ANEXO.largura / embutida.width, CAIXA_ANEXO.altura / embutida.height);
    const largura = embutida.width * escala;
    const altura = embutida.height * escala;
    // O pdf-lib mede a partir da base da página; o react-pdf, a partir do topo.
    const baseDaCaixa = alturaPagina - CAIXA_ANEXO.topo - CAIXA_ANEXO.altura;
    const posicao = {
      x: CAIXA_ANEXO.esquerda + (CAIXA_ANEXO.largura - largura) / 2,
      y: baseDaCaixa + (CAIXA_ANEXO.altura - altura) / 2,
      width: largura,
      height: altura,
    };
    pagina.drawPage(embutida, posicao);
    // Moldura fina para a página original não "sumir" no fundo branco.
    pagina.drawRectangle({ ...posicao, borderColor: rgb(0.886, 0.91, 0.941), borderWidth: 0.75 });
  }

  final.setProducer(PRODUTO.nome);
  final.setCreator(PRODUTO.nome);
  return new Uint8Array(await final.save());
}
