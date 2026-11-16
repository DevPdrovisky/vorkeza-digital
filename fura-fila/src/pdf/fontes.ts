import "server-only";
import path from "node:path";
import { Font } from "@react-pdf/renderer";

let registradas = false;

/** Registra a Inter (arquivos em src/pdf/fonts) uma única vez por processo. */
export function registrarFontes() {
  if (registradas) return;
  const pasta = path.join(process.cwd(), "src", "pdf", "fonts");
  Font.register({
    family: "Inter",
    fonts: [
      { src: path.join(pasta, "inter-400.woff"), fontWeight: 400 },
      { src: path.join(pasta, "inter-400-italic.woff"), fontWeight: 400, fontStyle: "italic" },
      { src: path.join(pasta, "inter-500.woff"), fontWeight: 500 },
      { src: path.join(pasta, "inter-600.woff"), fontWeight: 600 },
      { src: path.join(pasta, "inter-700.woff"), fontWeight: 700 },
    ],
  });
  // O react-pdf hifeniza com regras do inglês; em português isso quebra palavras no lugar errado.
  Font.registerHyphenationCallback((palavra) => [palavra]);
  registradas = true;
}
