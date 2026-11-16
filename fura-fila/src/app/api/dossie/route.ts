import { esquemaRespostas } from "@/lib/esquema";
import { erroJson, falhaInterna } from "@/lib/http";
import { repositorio } from "@/lib/repositorio";

/** Cria o dossiê (ainda não pago) com as respostas do formulário. */
export async function POST(req: Request) {
  const corpo = await req.json().catch(() => null);
  const validacao = esquemaRespostas.safeParse(corpo?.respostas);
  if (!validacao.success) {
    const primeiro = validacao.error.issues[0];
    return erroJson(400, primeiro?.message ?? "Revise as respostas do formulário.");
  }

  try {
    const dossie = await repositorio().criar(validacao.data);
    return Response.json({ id: dossie.id, respostas: dossie.respostas }, { status: 201 });
  } catch (e) {
    return falhaInterna("api/dossie", e);
  }
}
