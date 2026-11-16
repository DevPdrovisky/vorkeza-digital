import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { RESPOSTAS_EXEMPLO } from "@/lib/exemplo";
import type { EntradaPDF } from "./gerar";

// Dados fictícios para visualizar o template em /api/pdf-exemplo (só em desenvolvimento).

/** Um "holerite" de mentira em PDF, para testar a incorporação de comprovantes em PDF. */
async function holeriteFicticio() {
  const doc = await PDFDocument.create();
  const pagina = doc.addPage([595.28, 841.89]);
  const fonte = await doc.embedFont(StandardFonts.Helvetica);
  const negrito = await doc.embedFont(StandardFonts.HelveticaBold);
  pagina.drawRectangle({ x: 40, y: 700, width: 515, height: 100, color: rgb(0.95, 0.96, 0.98) });
  pagina.drawText("DEMONSTRATIVO DE PAGAMENTO (EXEMPLO)", { x: 56, y: 760, size: 14, font: negrito });
  pagina.drawText("Grupo Horizonte Ltda.  -  Competência: 10/2026", { x: 56, y: 738, size: 10, font: fonte });
  const linhas: [string, string][] = [
    ["Salário base", "R$ 7.200,00"],
    ["Gratificação", "R$ 900,00"],
    ["INSS", "- R$ 828,38"],
    ["IRRF", "- R$ 912,55"],
    ["Líquido a receber", "R$ 6.359,07"],
  ];
  linhas.forEach(([rotulo, valor], i) => {
    const y = 660 - i * 26;
    const font = i === linhas.length - 1 ? negrito : fonte;
    pagina.drawText(rotulo, { x: 56, y, size: 11, font });
    pagina.drawText(valor, { x: 430, y, size: 11, font });
  });
  pagina.drawText("Documento fictício gerado para demonstração do layout.", {
    x: 56,
    y: 120,
    size: 9,
    font: fonte,
    color: rgb(0.45, 0.5, 0.58),
  });
  return doc.save();
}

export async function entradaExemplo(baseUrl: string): Promise<EntradaPDF> {
  const agora = new Date();
  return {
    codigo: "FF-7K3M9-QX2DH",
    emitidoEm: agora,
    aceiteEm: agora,
    respostas: RESPOSTAS_EXEMPLO,
    anexos: [{ nome: "holerite-outubro-2026.pdf", tipo: "application/pdf", bytes: await holeriteFicticio() }],
    baseUrl,
  };
}
