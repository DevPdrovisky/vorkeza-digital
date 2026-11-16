const FUSO = "America/Sao_Paulo";

const moedaInteira = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const moedaCentavos = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const numero = new Intl.NumberFormat("pt-BR");

/** R$ 1.800 (o Intl usa espaço não separável entre "R$" e o número; trocamos por espaço comum). */
export const brl = (valor: number) => moedaInteira.format(valor).replace(/ /g, " ");
export const brlCentavos = (centavos: number) =>
  moedaCentavos.format(centavos / 100).replace(/ /g, " ");
export const milhar = (valor: number) => numero.format(valor);

export function dataPorExtenso(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: FUSO,
  }).format(data);
}

export function dataHora(data: Date) {
  const dia = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: FUSO,
  }).format(data);
  const hora = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: FUSO,
  }).format(data);
  return `${dia} às ${hora}`;
}

export const apenasDigitos = (valor: string) => valor.replace(/\D/g, "");

/** Máscara de telefone brasileiro: (DDD) NUMERO ou (19) 3333-4444. */
export function formatarTelefone(valor: string) {
  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export const primeiroNome = (nome: string) => {
  const p = nome.trim().split(/\s+/)[0] ?? "";
  return p ? p.charAt(0).toLocaleUpperCase("pt-BR") + p.slice(1) : "";
};

const PARTICULAS = new Set(["da", "das", "de", "do", "dos", "e"]);

/** "MARIANA DA COSTA" ou "mariana da costa" viram "Mariana da Costa". Nomes já com maiúsculas e minúsculas ficam como estão. */
export function nomeProprio(nome: string) {
  const limpo = nome.trim().replace(/\s+/g, " ");
  if (limpo !== limpo.toLowerCase() && limpo !== limpo.toUpperCase()) return limpo;
  return limpo
    .toLowerCase()
    .split(" ")
    .map((p, i) => (i > 0 && PARTICULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(" ");
}

export function slug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const plural = (n: number, singular: string, pluralForma: string) =>
  `${n} ${n === 1 ? singular : pluralForma}`;
