export const erroJson = (status: number, erro: string) => Response.json({ erro }, { status });

/** Mensagem curta para o usuário; o detalhe técnico vai para o log do servidor. */
export function falhaInterna(contexto: string, e: unknown) {
  console.error(`[${contexto}]`, e);
  const mensagem = e instanceof Error && e.message.includes("não configurado") ? e.message : null;
  return erroJson(500, mensagem ?? "Erro inesperado. Tente novamente em instantes.");
}
