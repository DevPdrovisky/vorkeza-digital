import type { Respostas } from "./dossie";

/** Candidata fictícia usada na landing (miniatura) e no PDF de exemplo. */
export const RESPOSTAS_EXEMPLO: Respostas = {
  nome: "Mariana Costa Ribeiro",
  idade: 34,
  profissao: "Analista de Marketing",
  empresa: "Grupo Horizonte",
  tempoEmpresa: "3a-5a",
  email: "mariana.ribeiro@exemplo.com.br",
  whatsapp: "19999990000",
  pessoas: 2,
  pet: "pequeno",
  faixaRenda: "6k-10k",
  referencia: {
    primeiraLocacao: false,
    nome: "Imobiliária Lar Modelo",
    telefone: "1933330000",
    periodo: "2021 a 2025",
  },
  recado:
    "Moro com meu marido e nossa cachorrinha, a Mel. Procuramos um lugar para ficar pelo menos 3 anos, perto do trabalho. Cuidamos do imóvel como se fosse nosso.",
  consentimento: true,
};
