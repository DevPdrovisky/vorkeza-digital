import { connection } from "next/server";
import { erroJson, falhaInterna } from "@/lib/http";
import { repositorio } from "@/lib/repositorio";

/** Consultado pela página de sucesso enquanto o webhook da Stripe não chega (ex.: Pix). */
export async function GET(_req: Request, ctx: RouteContext<"/api/dossie/[id]/status">) {
  await connection();
  const { id } = await ctx.params;
  try {
    const dossie = await repositorio().buscar(id);
    if (!dossie) return erroJson(404, "Dossiê não encontrado.");
    return Response.json({ status: dossie.status }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return falhaInterna("api/status", e);
  }
}
