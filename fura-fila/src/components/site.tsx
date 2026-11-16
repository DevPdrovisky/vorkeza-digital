import Link from "next/link";
import type { ReactNode } from "react";
import { linkVitrineImovel } from "@/lib/config";
import { botaoEscuro } from "./ui/estilos";
import { Logo } from "./ui/logo";

export function CabecalhoSite({ comCta = true }: { comCta?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Fura-Fila de Aluguéis — início" className="rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marca-300">
          <Logo />
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5">
          <Link href="/meus-dossies" className="text-sm font-medium text-slate-600 transition hover:text-tinta-900">
            Meus dossiês
          </Link>
          {comCta && (
            <Link href="/criar" className={`${botaoEscuro} hidden !py-2.5 sm:inline-flex`}>
              Criar dossiê
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function RodapeSite() {
  return (
    <footer className="bg-tinta-950 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo claro />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            O Dossiê do Inquilino organiza renda, referências e comprovantes em um PDF profissional, para você
            sair na frente na disputa por um bom imóvel.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Inquilinos</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/criar" className="hover:text-white">Criar meu dossiê</Link>
            </li>
            <li>
              <Link href="/meus-dossies" className="hover:text-white">Meus dossiês</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Corretores e imobiliárias</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/verificar" className="hover:text-white">Verificar um dossiê</Link>
            </li>
            <li>
              <a href={linkVitrineImovel("site")} className="hover:text-white" target="_blank" rel="noopener">
                Conheça a Vitrine Imóvel
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-slate-500 sm:px-6">
          Fura-Fila de Aluguéis. O dossiê reúne informações declaradas pelo candidato e não substitui a análise
          de crédito do proprietário ou da imobiliária.
        </p>
      </div>
    </footer>
  );
}

/** Moldura simples das páginas internas (sucesso, verificação, meus dossiês). */
export function PaginaInterna({ children }: { children: ReactNode }) {
  return (
    <>
      <CabecalhoSite />
      <main className="flex-1 bg-slate-50">{children}</main>
      <RodapeSite />
    </>
  );
}

/** Moldura enxuta para as telas de compra (paywall e sucesso): só a marca, sem distrações. */
export function PaginaCompra({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-white to-slate-50">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4 sm:px-6">
          <Link href="/" aria-label="Fura-Fila de Aluguéis — início">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center">{children}</main>
    </div>
  );
}

export function Carregando({ texto }: { texto: string }) {
  return (
    <div className="mx-auto flex flex-col items-center gap-4 px-4 py-24 text-center" role="status">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-marca-600" aria-hidden="true" />
      <p className="text-sm font-medium text-slate-500">{texto}</p>
    </div>
  );
}

export function Aviso({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16 text-center sm:px-6">
      <h1 className="text-2xl font-bold text-tinta-900">{titulo}</h1>
      <div className="mt-3 text-slate-600">{children}</div>
    </div>
  );
}
