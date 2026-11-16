// Preparação de comprovantes no navegador, antes do envio.
// Fotos são redimensionadas e convertidas para JPEG: o upload fica rápido e o PDF final leve para o WhatsApp.

import { LIMITES } from "./config";

const LADO_MAXIMO = 2000;
const QUALIDADE = 0.85;

export async function prepararComprovante(arquivo: File): Promise<File> {
  if (arquivo.type === "application/pdf" || arquivo.name.toLowerCase().endsWith(".pdf")) {
    if (arquivo.size > LIMITES.bytesPorArquivo) {
      throw new Error(`"${arquivo.name}" passa de 4 MB. Envie uma versão menor ou uma foto da página.`);
    }
    return new File([arquivo], arquivo.name, { type: "application/pdf" });
  }

  if (!arquivo.type.startsWith("image/")) {
    throw new Error(`"${arquivo.name}" não é foto nem PDF.`);
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(arquivo);
  } catch {
    throw new Error(`Não conseguimos abrir "${arquivo.name}". Tente uma foto em JPG ou PNG.`);
  }

  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Seu navegador não conseguiu processar a imagem.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, largura, altura);
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();

  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", QUALIDADE));
  if (!blob) throw new Error("Seu navegador não conseguiu processar a imagem.");
  if (blob.size > LIMITES.bytesPorArquivo) throw new Error(`"${arquivo.name}" ficou grande demais mesmo comprimida.`);

  const nome = `${arquivo.name.replace(/\.[^.]+$/, "") || "comprovante"}.jpg`;
  return new File([blob], nome, { type: "image/jpeg" });
}

export function tamanhoLegivel(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}
