"use client";

import { useState, useSyncExternalStore } from "react";
import { botaoSecundario } from "./ui/estilos";
import { IconeEnviar } from "./ui/icones";

const nada = () => () => {};
/** Compartilhar arquivo só existe em celulares e alguns navegadores (Web Share API). */
const suporta = () =>
  typeof navigator !== "undefined" &&
  typeof navigator.canShare === "function" &&
  navigator.canShare({ files: [new File([""], "teste.pdf", { type: "application/pdf" })] });

/** No celular, abre a folha de compartilhamento com o PDF anexado (WhatsApp, e-mail…). */
export function BotaoCompartilhar({ url, arquivo }: { url: string; arquivo: string }) {
  const disponivel = useSyncExternalStore(nada, suporta, () => false);
  const [ocupado, setOcupado] = useState(false);

  if (!disponivel) return null;

  async function compartilhar() {
    setOcupado(true);
    try {
      const resposta = await fetch(url);
      const pdf = new File([await resposta.blob()], arquivo, { type: "application/pdf" });
      await navigator.share({
        files: [pdf],
        title: "Meu Dossiê do Inquilino",
        text: "Segue meu Dossiê do Inquilino com renda, referências e comprovantes.",
      });
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) window.location.assign(url);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <button type="button" onClick={compartilhar} disabled={ocupado} className={`${botaoSecundario} w-full sm:w-auto`}>
      <IconeEnviar className="h-4 w-4" />
      {ocupado ? "Preparando…" : "Enviar pelo WhatsApp"}
    </button>
  );
}
