import type { Metadata } from "next";
import { Suspense } from "react";
import { PaginaInterna } from "@/components/site";
import { loginConfigurado } from "@/lib/ambiente";
import { FormularioEntrar } from "./formulario";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default function PaginaEntrar({ searchParams }: PageProps<"/entrar">) {
  return (
    <PaginaInterna>
      <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-tinta-900">Acessar meus dossiês</h1>
        <p className="mt-3 text-slate-600">
          Informe o e-mail que você usou no formulário. Enviamos um link de acesso, sem senha.
        </p>
        {loginConfigurado() ? (
          <Suspense fallback={null}>
            <ComErro searchParams={searchParams} />
          </Suspense>
        ) : (
          <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            O login ainda não foi configurado. Preencha as variáveis do Supabase no arquivo .env.local.
          </p>
        )}
      </div>
    </PaginaInterna>
  );
}

async function ComErro({ searchParams }: Pick<PageProps<"/entrar">, "searchParams">) {
  const { erro } = await searchParams;
  return <FormularioEntrar linkInvalido={erro === "link"} />;
}
