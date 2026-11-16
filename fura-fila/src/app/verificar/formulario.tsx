"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { botaoEscuro } from "@/components/ui/estilos";
import { normalizarCodigo } from "@/lib/codigo";

export function FormularioVerificacao() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  return (
    <form
      className="mt-8"
      onSubmit={(e) => {
        e.preventDefault();
        const normal = normalizarCodigo(codigo);
        if (!normal) {
          setErro("O código tem o formato FF-XXXXX-XXXXX.");
          return;
        }
        router.push(`/verificar/${normal}`);
      }}
    >
      <label htmlFor="codigo" className="text-sm font-medium text-slate-700">
        Código de autenticidade
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id="codigo"
          value={codigo}
          onChange={(e) => {
            setCodigo(e.target.value);
            setErro(null);
          }}
          placeholder="FF-XXXXX-XXXXX"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 font-mono text-lg uppercase tracking-wider text-tinta-900 placeholder:text-slate-300 focus:border-marca-600 focus:outline-none"
        />
        <button type="submit" className={`${botaoEscuro} py-3`}>
          Verificar
        </button>
      </div>
      {erro && (
        <p role="alert" className="mt-2 text-sm text-rose-600">
          {erro}
        </p>
      )}
    </form>
  );
}
