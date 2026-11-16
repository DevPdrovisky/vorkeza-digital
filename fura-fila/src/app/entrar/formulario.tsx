"use client";

import { useState } from "react";
import { botaoPrimario } from "@/components/ui/estilos";
import { supabaseNavegador } from "@/lib/supabase/navegador";

export function FormularioEntrar({ linkInvalido }: { linkInvalido: boolean }) {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"livre" | "enviando" | "enviado">("livre");
  const [erro, setErro] = useState<string | null>(linkInvalido ? "O link expirou ou já foi usado. Peça um novo." : null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEstado("enviando");
    const { error } = await supabaseNavegador().auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/auth/confirmar?next=/meus-dossies` },
    });
    if (error) {
      setErro("Não foi possível enviar o link agora. Tente de novo em instantes.");
      setEstado("livre");
      return;
    }
    setEstado("enviado");
  }

  if (estado === "enviado") {
    return (
      <div className="mt-8 rounded-2xl border border-marca-100 bg-marca-50 p-5 text-sm text-tinta-900">
        <p className="font-semibold">Link enviado para {email}.</p>
        <p className="mt-1 text-slate-600">Abra o e-mail neste mesmo aparelho e toque no link para entrar.</p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="mt-8 space-y-3">
      <label htmlFor="email" className="text-sm font-medium text-slate-700">
        E-mail
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="voce@email.com"
        className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg text-tinta-900 placeholder:text-slate-300 focus:border-marca-600 focus:outline-none"
      />
      <button type="submit" disabled={estado === "enviando"} className={`${botaoPrimario} w-full`}>
        {estado === "enviando" ? "Enviando…" : "Receber link de acesso"}
      </button>
      {erro && (
        <p role="alert" className="text-sm text-rose-600">
          {erro}
        </p>
      )}
    </form>
  );
}
