"use client";

import { useEffect, useState } from "react";
import { IconeCheck } from "@/components/ui/icones";

const ETAPAS = [
  "Validando dados pessoais",
  "Calculando capacidade de pagamento",
  "Organizando referências e comprovantes",
  "Aplicando layout executivo",
];

/** Tela de análise exibida por no mínimo 3 segundos antes do paywall. */
export function Processando() {
  const [concluidas, setConcluidas] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setConcluidas((n) => Math.min(n + 1, ETAPAS.length)), 700);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-md animate-surgir flex-col items-center px-4 text-center" role="status" aria-live="polite">
      <div className="relative h-16 w-16" aria-hidden="true">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-marca-600" />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-tinta-900 sm:text-3xl">
        Analisando perfil e gerando dossiê premium...
      </h1>

      <ul className="mt-7 w-full space-y-2.5 text-left">
        {ETAPAS.map((etapa, i) => {
          const feita = i < concluidas;
          const atual = i === concluidas;
          return (
            <li
              key={etapa}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                feita ? "border-marca-100 bg-marca-50 text-tinta-900" : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  feita ? "bg-marca-600 text-white" : "bg-slate-100"
                }`}
              >
                {feita ? (
                  <IconeCheck className="h-3.5 w-3.5" />
                ) : atual ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-marca-600" />
                ) : null}
              </span>
              {etapa}
            </li>
          );
        })}
      </ul>

      <div className="mt-8 w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-hidden="true">
        <div className="h-12 animate-pulse rounded-lg bg-tinta-900/90" />
        <div className="mt-4 space-y-2">
          <div className="h-2.5 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-2.5 w-11/12 animate-pulse rounded bg-slate-200" />
          <div className="h-2.5 w-3/4 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
