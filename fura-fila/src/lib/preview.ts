import {
  opcao,
  PORTES_PET,
  pontosFortes,
  textoCapacidade,
  textoMoradores,
  textoRenda,
  textoTempo,
  type Respostas,
} from "./dossie";

export type PreviewDossie = {
  nome: string;
  cargo: string;
  chips: string[];
  indicadores: { rotulo: string; valor: string; destaque?: boolean }[];
  pontos: string[];
};

/** Dados da miniatura do dossiê (landing e paywall) a partir das respostas. */
export function previewDasRespostas(r: Respostas, qtdComprovantes: number): PreviewDossie {
  const pet = opcao(PORTES_PET, r.pet);
  return {
    nome: r.nome,
    cargo: r.empresa ? `${r.profissao} · ${r.empresa}` : r.profissao,
    chips: [
      `${r.idade} anos`,
      textoMoradores(r.pessoas),
      pet.id === "nenhum" ? "Sem pets" : `Pet ${pet.rotulo.toLowerCase()}`,
    ],
    indicadores: [
      { rotulo: "Renda mensal", valor: textoRenda(r.faixaRenda, "curto") },
      { rotulo: "Aluguel compatível", valor: textoCapacidade(r.faixaRenda, "curto"), destaque: true },
      { rotulo: "Vínculo profissional", valor: textoTempo(r.tempoEmpresa, "curto") },
      { rotulo: "Moradores", valor: textoMoradores(r.pessoas) },
    ],
    pontos: pontosFortes(r, qtdComprovantes).slice(0, 3),
  };
}
