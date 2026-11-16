// Domínio do Dossiê do Inquilino: opções do formulário, tipos e textos derivados.
// Usado no navegador (formulário e paywall) e no servidor (API e PDF).

import { COMPROMETIMENTO_RENDA } from "./config";
import { brl, milhar, plural } from "./formatar";

export const TEMPOS_EMPRESA = [
  { id: "menos-6m", rotulo: "Menos de 6 meses", curto: "Menos de 6 meses", frase: "há menos de 6 meses", estavel: false },
  { id: "6m-1a", rotulo: "De 6 meses a 1 ano", curto: "6 meses a 1 ano", frase: "há entre 6 meses e 1 ano", estavel: false },
  { id: "1a-3a", rotulo: "De 1 a 3 anos", curto: "1 a 3 anos", frase: "há entre 1 e 3 anos", estavel: true },
  { id: "3a-5a", rotulo: "De 3 a 5 anos", curto: "3 a 5 anos", frase: "há entre 3 e 5 anos", estavel: true },
  { id: "5a-mais", rotulo: "Mais de 5 anos", curto: "Mais de 5 anos", frase: "há mais de 5 anos", estavel: true },
] as const;

export const MORADORES = [
  { id: "1", rotulo: "Só eu" },
  { id: "2", rotulo: "2 pessoas" },
  { id: "3", rotulo: "3 pessoas" },
  { id: "4", rotulo: "4 pessoas" },
  { id: "5", rotulo: "5 ou mais" },
] as const;

export const PORTES_PET = [
  { id: "nenhum", rotulo: "Não tenho pet", detalhe: "Sem animais de estimação" },
  { id: "pequeno", rotulo: "Pequeno porte", detalhe: "até 10 kg" },
  { id: "medio", rotulo: "Médio porte", detalhe: "de 10 a 25 kg" },
  { id: "grande", rotulo: "Grande porte", detalhe: "acima de 25 kg" },
] as const;

export const FAIXAS_RENDA = [
  { id: "ate-2k", min: 0, max: 2000 },
  { id: "2k-4k", min: 2000, max: 4000 },
  { id: "4k-6k", min: 4000, max: 6000 },
  { id: "6k-10k", min: 6000, max: 10000 },
  { id: "10k-15k", min: 10000, max: 15000 },
  { id: "15k-mais", min: 15000, max: null },
] as const satisfies readonly { id: string; min: number; max: number | null }[];

export type TempoEmpresaId = (typeof TEMPOS_EMPRESA)[number]["id"];
export type PortePetId = (typeof PORTES_PET)[number]["id"];
export type FaixaRendaId = (typeof FAIXAS_RENDA)[number]["id"];
type FaixaRenda = (typeof FAIXAS_RENDA)[number];

export type Respostas = {
  nome: string;
  idade: number;
  profissao: string;
  empresa: string;
  tempoEmpresa: TempoEmpresaId;
  email: string;
  /** Somente dígitos, com DDD. */
  whatsapp: string;
  /** 1 a 5 (5 = "5 ou mais"). */
  pessoas: number;
  pet: PortePetId;
  faixaRenda: FaixaRendaId;
  referencia: {
    primeiraLocacao: boolean;
    nome: string;
    /** Somente dígitos, com DDD. */
    telefone: string;
    periodo: string;
  };
  recado: string;
  consentimento: true;
};

export function opcao<T extends { id: string }>(lista: readonly T[], id: string): T {
  return lista.find((o) => o.id === id) ?? lista[0];
}

type Estilo = "rotulo" | "frase" | "curto";

/** Escreve um intervalo de valores em reais em três estilos: rótulo, frase corrida ou curto (cartões do PDF). */
function intervalo(min: number, max: number | null, estilo: Estilo) {
  if (min === 0 && max !== null) {
    if (estilo === "rotulo") return `Até ${brl(max)}`;
    return estilo === "frase" ? `de até ${brl(max)}` : `até ${brl(max)}`;
  }
  if (max === null) return estilo === "rotulo" ? `Acima de ${brl(min)}` : `acima de ${brl(min)}`;
  if (estilo === "curto") return `${brl(min)} – ${milhar(max)}`;
  return estilo === "frase" ? `de ${brl(min)} a ${brl(max)}` : `${brl(min)} a ${brl(max)}`;
}

const arredondar50 = (v: number) => Math.round(v / 50) * 50;

export function textoRenda(faixaId: string, estilo: Estilo = "rotulo") {
  const f = opcao<FaixaRenda>(FAIXAS_RENDA, faixaId);
  return intervalo(f.min, f.max, estilo);
}

/** Faixa de aluguel compatível com a renda declarada (regra dos 30%). */
export function textoCapacidade(faixaId: string, estilo: Estilo = "rotulo") {
  const f = opcao<FaixaRenda>(FAIXAS_RENDA, faixaId);
  const min = arredondar50(f.min * COMPROMETIMENTO_RENDA);
  const max = f.max === null ? null : arredondar50(f.max * COMPROMETIMENTO_RENDA);
  return intervalo(min, max, estilo);
}

export function textoMoradores(pessoas: number) {
  if (pessoas >= 5) return "5 ou mais pessoas";
  return plural(pessoas, "pessoa", "pessoas");
}

export function textoPet(pet: string) {
  const p = opcao(PORTES_PET, pet);
  if (p.id === "nenhum") return p.detalhe;
  return `Pet de ${p.rotulo.toLowerCase()} (${p.detalhe})`;
}

export function textoTempo(tempo: string, estilo: "rotulo" | "curto" | "frase" = "rotulo") {
  return opcao(TEMPOS_EMPRESA, tempo)[estilo];
}

/** Parágrafo de abertura do dossiê, escrito a partir das respostas. Linguagem neutra e só com fatos declarados. */
export function resumoExecutivo(r: Respostas, qtdComprovantes: number) {
  const empresa = r.empresa ? ` na empresa ${r.empresa}` : "";
  const frases = [
    `${r.nome}, ${r.idade} anos, atua como ${r.profissao}${empresa} ${textoTempo(r.tempoEmpresa, "frase")}.`,
    `O imóvel será ocupado por ${textoMoradores(r.pessoas)}${
      r.pet === "nenhum" ? ", sem animais de estimação" : `, com um pet de ${opcao(PORTES_PET, r.pet).rotulo.toLowerCase()}`
    }.`,
    `Declara renda mensal ${textoRenda(r.faixaRenda, "frase")}, compatível com aluguel ${textoCapacidade(
      r.faixaRenda,
      "frase",
    )} pela regra de comprometimento de 30% da renda.`,
  ];
  if (qtdComprovantes > 0) {
    frases.push(
      `${qtdComprovantes === 1 ? "Um comprovante de renda foi anexado" : `${qtdComprovantes} comprovantes de renda foram anexados`} a este dossiê.`,
    );
  }
  frases.push(
    r.referencia.primeiraLocacao
      ? "Esta será a primeira locação do candidato."
      : `Indica como referência o locador anterior, ${r.referencia.nome}, disponível para contato.`,
  );
  return frases.join(" ");
}

/** Pontos fortes listados no PDF. Só entra o que foi de fato declarado ou anexado. */
export function pontosFortes(r: Respostas, qtdComprovantes: number) {
  const pontos: string[] = [];
  const tempo = opcao(TEMPOS_EMPRESA, r.tempoEmpresa);
  pontos.push(
    tempo.estavel
      ? `Vínculo profissional estável: ${tempo.curto.toLowerCase()} no trabalho atual`
      : `Atividade profissional declarada: ${r.profissao}`,
  );
  if (qtdComprovantes > 0) {
    pontos.push(
      qtdComprovantes === 1
        ? "Comprovante de renda anexado ao dossiê"
        : `${qtdComprovantes} comprovantes de renda anexados ao dossiê`,
    );
  }
  if (!r.referencia.primeiraLocacao) pontos.push("Referência de locador anterior disponível para contato");
  if (r.pet === "nenhum") pontos.push("Sem animais de estimação");
  pontos.push("Contatos completos: e-mail e WhatsApp");
  if (r.recado) pontos.push("Carta de apresentação ao proprietário");
  pontos.push("Declaração de veracidade aceita eletronicamente");
  return pontos.slice(0, 6);
}
