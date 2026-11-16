// Regras de negócio e textos fixos do produto, em um só lugar.

export const PRODUTO = {
  nome: "Fura-Fila de Aluguéis",
  nomeCurto: "Fura-Fila",
  documento: "Dossiê do Inquilino",
  precoCentavos: 2990,
  moeda: "brl",
} as const;

/**
 * REQUISITO B2B — texto EXATO impresso no rodapé de TODAS as páginas do PDF.
 * Não altere sem alinhar com a estratégia da Vitrine Imóvel.
 */
export const RODAPE_B2B =
  "Documento autenticado via Fura-Fila de Aluguéis. Conheça a tecnologia Vitrine Imóvel para a sua imobiliária.";

const VITRINE_IMOVEL_URL =
  process.env.NEXT_PUBLIC_VITRINE_IMOVEL_URL || "https://vitrineimovel.pages.dev/";

/** Link para a Vitrine Imóvel com UTM, para medir quantas imobiliárias chegam por cada canal. */
export function linkVitrineImovel(origem: "pdf" | "verificacao" | "site") {
  const url = new URL(VITRINE_IMOVEL_URL);
  url.searchParams.set("utm_source", "fura-fila");
  url.searchParams.set("utm_medium", origem);
  url.searchParams.set("utm_campaign", "dossie-inquilino");
  return url.toString();
}

export const LIMITES = {
  arquivos: 3,
  /** Abaixo do limite de 4,5 MB por requisição da Vercel. Fotos são comprimidas no navegador antes do envio. */
  bytesPorArquivo: 4 * 1024 * 1024,
  /** Páginas de cada PDF de comprovante que entram no dossiê. */
  paginasPorPdf: 5,
  recado: 400,
} as const;

/** Regra de mercado: o aluguel não deve passar de 30% da renda mensal. */
export const COMPROMETIMENTO_RENDA = 0.3;
