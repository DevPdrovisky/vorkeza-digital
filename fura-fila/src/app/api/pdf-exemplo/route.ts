import { connection } from "next/server";
import { emDesenvolvimento, urlDoSite } from "@/lib/ambiente";
import { entradaExemplo } from "@/pdf/exemplo";
import { gerarPdfDossie } from "@/pdf/gerar";

/** Só em desenvolvimento: PDF com dados fictícios para ajustar o template (src/pdf/DossiePDF.tsx). */
export async function GET(req: Request) {
  await connection();
  if (!emDesenvolvimento) return new Response("Não encontrado", { status: 404 });
  const pdf = await gerarPdfDossie(await entradaExemplo(urlDoSite(req)));
  return new Response(pdf, {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": 'inline; filename="dossie-exemplo.pdf"' },
  });
}
