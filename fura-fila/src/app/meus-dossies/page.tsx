import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Carregando, PaginaInterna } from "@/components/site";
import { botaoPrimario, botaoSecundario } from "@/components/ui/estilos";
import { IconeBaixar } from "@/components/ui/icones";
import { demoBanco, loginConfigurado } from "@/lib/ambiente";
import { dataPorExtenso, slug } from "@/lib/formatar";
import { supabaseServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Meus dossiês", robots: { index: false } };

export default function PaginaMeusDossies() {
  return (
    <PaginaInterna>
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <Suspense fallback={<Carregando texto="Carregando seus dossiês…" />}>
          <Lista />
        </Suspense>
      </div>
    </PaginaInterna>
  );
}

type Linha = { id: string; codigo: string; nome: string; pago_em: string | null; created_at: string };

async function Lista() {
  if (!loginConfigurado() || demoBanco()) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h1 className="text-xl font-bold">Login ainda não configurado</h1>
        <p className="mt-2 text-sm">
          “Meus dossiês” usa o login por e-mail do Supabase. Preencha as variáveis do Supabase no .env.local e
          rode o arquivo supabase/schema.sql. No modo demonstração, use o link da página de confirmação.
        </p>
      </div>
    );
  }

  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  // O RLS garante que só voltam os dossiês pagos do e-mail logado.
  const { data, error } = await supabase
    .from("dossies")
    .select("id, codigo, nome, pago_em, created_at")
    .order("pago_em", { ascending: false })
    .returns<Linha[]>();
  if (error) throw new Error(error.message);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-tinta-900">Meus dossiês</h1>
          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
        </div>
        <form action="/auth/sair" method="post">
          <button type="submit" className="text-sm font-medium text-slate-500 underline-offset-2 hover:text-tinta-900 hover:underline">
            Sair
          </button>
        </form>
      </div>

      {data.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">Nenhum dossiê pago neste e-mail ainda.</p>
          <Link href="/criar" className={`${botaoPrimario} mt-6`}>
            Criar meu dossiê
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {data.map((d) => (
            <li
              key={d.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-tinta-900">{d.nome}</p>
                <p className="text-sm text-slate-500">
                  {dataPorExtenso(new Date(d.pago_em ?? d.created_at))} · <span className="font-mono">{d.codigo}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/api/dossie/${d.id}/pdf`}
                  download={`dossie-inquilino-${slug(d.nome)}.pdf`}
                  className={`${botaoPrimario} !px-4 !py-2.5 text-sm`}
                >
                  <IconeBaixar className="h-4 w-4" />
                  Baixar
                </a>
                <Link href={`/dossie/${d.id}`} className={`${botaoSecundario} !py-2.5`}>
                  Abrir
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
