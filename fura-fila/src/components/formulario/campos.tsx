"use client";

import type { ChangeEvent, InputHTMLAttributes } from "react";
import { IconeCheck, IconeClipe, IconeDocumento, IconeX } from "@/components/ui/icones";
import { tamanhoLegivel } from "@/lib/imagem";

export const LETRAS = ["A", "B", "C", "D", "E", "F", "G"];

type PropsTexto = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "size"> & {
  valor: string;
  aoMudar: (valor: string) => void;
  rotulo?: string;
  tamanho?: "grande" | "medio";
  /** Marca o campo que recebe o foco ao abrir a tela. */
  foco?: boolean;
};

export function CampoTexto({ valor, aoMudar, rotulo, tamanho = "grande", foco, id, ...resto }: PropsTexto) {
  return (
    <label className="block" htmlFor={id}>
      {rotulo && <span className="mb-1 block text-sm font-medium text-slate-500">{rotulo}</span>}
      <input
        id={id}
        value={valor}
        onChange={(e: ChangeEvent<HTMLInputElement>) => aoMudar(e.target.value)}
        data-autofoco={foco ? "" : undefined}
        className={`w-full rounded-none border-0 border-b-2 border-slate-300 bg-transparent px-0 pb-2 pt-1 font-medium text-tinta-900 caret-marca-600 transition-colors placeholder:text-slate-300 focus:border-marca-600 focus:outline-none focus:ring-0 disabled:opacity-40 ${
          tamanho === "grande" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
        }`}
        {...resto}
      />
    </label>
  );
}

type Opcao = { id: string; rotulo: string; detalhe?: string };

export function Opcoes({
  opcoes,
  valor,
  aoEscolher,
  rotulo,
}: {
  opcoes: readonly Opcao[];
  valor: string;
  aoEscolher: (id: string) => void;
  rotulo: string;
}) {
  return (
    <div role="radiogroup" aria-label={rotulo} className="grid gap-2.5 sm:max-w-md">
      {opcoes.map((o, i) => {
        const ativo = o.id === valor;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => aoEscolher(o.id)}
            className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marca-100 ${
              ativo ? "border-marca-600 bg-marca-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <kbd
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border font-sans text-xs font-bold ${
                ativo ? "border-marca-600 bg-marca-600 text-white" : "border-slate-300 bg-white text-slate-500"
              }`}
            >
              {LETRAS[i]}
            </kbd>
            <span className="flex-1">
              <span className="block font-semibold text-tinta-900">{o.rotulo}</span>
              {o.detalhe && <span className="block text-sm text-slate-500">{o.detalhe}</span>}
            </span>
            {ativo && <IconeCheck className="h-5 w-5 text-marca-600" />}
          </button>
        );
      })}
    </div>
  );
}

export function Caixa({
  marcado,
  aoMudar,
  children,
  foco,
}: {
  marcado: boolean;
  aoMudar: (v: boolean) => void;
  children: React.ReactNode;
  foco?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3 transition ${
        marcado ? "border-marca-600 bg-marca-50" : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <input
        type="checkbox"
        checked={marcado}
        onChange={(e) => aoMudar(e.target.checked)}
        data-autofoco={foco ? "" : undefined}
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 accent-marca-600"
      />
      <span className="text-sm leading-relaxed text-slate-700">{children}</span>
    </label>
  );
}

export function AreaUpload({
  arquivos,
  limite,
  preparando,
  aoAdicionar,
  aoRemover,
}: {
  arquivos: File[];
  limite: number;
  preparando: boolean;
  aoAdicionar: (lista: FileList | null) => void;
  aoRemover: (indice: number) => void;
}) {
  const cheio = arquivos.length >= limite;
  return (
    <div className="space-y-3 sm:max-w-lg">
      {!cheio && (
        <label
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
            preparando ? "border-marca-300 bg-marca-50" : "border-slate-300 bg-white hover:border-marca-500 hover:bg-marca-50/50"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-tinta-900 text-white">
            <IconeClipe />
          </span>
          <span className="font-semibold text-tinta-900">
            {preparando ? "Preparando arquivo…" : "Toque para escolher foto ou PDF"}
          </span>
          <span className="text-sm text-slate-500">
            Até {limite} arquivos · fotos são otimizadas automaticamente
          </span>
          <input
            type="file"
            accept="image/*,application/pdf"
            multiple
            className="sr-only"
            disabled={preparando}
            onChange={(e) => {
              aoAdicionar(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      )}
      {arquivos.length > 0 && (
        <ul className="space-y-2">
          {arquivos.map((a, i) => (
            <li
              key={`${a.name}-${i}`}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <IconeDocumento className="h-5 w-5 shrink-0 text-marca-600" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-tinta-900">{a.name}</span>
                <span className="block text-xs text-slate-500">{tamanhoLegivel(a.size)}</span>
              </span>
              <button
                type="button"
                onClick={() => aoRemover(i)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-rose-600"
                aria-label={`Remover ${a.name}`}
              >
                <IconeX className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
