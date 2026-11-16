// Validação no servidor de tudo o que chega do formulário.

import { z } from "zod";
import { LIMITES } from "./config";
import {
  FAIXAS_RENDA,
  PORTES_PET,
  TEMPOS_EMPRESA,
  type FaixaRendaId,
  type PortePetId,
  type Respostas,
  type TempoEmpresaId,
} from "./dossie";
import { apenasDigitos, nomeProprio } from "./formatar";

const ids = <T extends string>(lista: readonly { id: T }[]) =>
  lista.map((o) => o.id) as [T, ...T[]];

const telefone = z
  .string()
  .transform(apenasDigitos)
  .refine((d) => d.length === 10 || d.length === 11, "Telefone com DDD inválido.");

export const esquemaRespostas = z.object({
  nome: z
    .string()
    .trim()
    .min(3)
    .max(120)
    .refine((n) => n.split(/\s+/).length >= 2, "Informe nome e sobrenome.")
    .transform(nomeProprio),
  idade: z.coerce.number().int().min(18).max(110),
  profissao: z.string().trim().min(2).max(80),
  empresa: z.string().trim().max(80).default(""),
  tempoEmpresa: z.enum(ids<TempoEmpresaId>(TEMPOS_EMPRESA)),
  email: z.string().trim().toLowerCase().pipe(z.email().max(160)),
  whatsapp: telefone,
  pessoas: z.coerce.number().int().min(1).max(5),
  pet: z.enum(ids<PortePetId>(PORTES_PET)),
  faixaRenda: z.enum(ids<FaixaRendaId>(FAIXAS_RENDA)),
  referencia: z
    .object({
      primeiraLocacao: z.boolean(),
      nome: z.string().trim().max(120).default(""),
      telefone: z.string().default("").transform(apenasDigitos),
      periodo: z.string().trim().max(60).default(""),
    })
    .refine(
      (r) => r.primeiraLocacao || (r.nome.length >= 2 && [10, 11].includes(r.telefone.length)),
      "Informe nome e telefone do locador anterior, ou marque que é sua primeira locação.",
    )
    .transform((r) =>
      r.primeiraLocacao ? { primeiraLocacao: true, nome: "", telefone: "", periodo: "" } : r,
    ),
  recado: z.string().trim().max(LIMITES.recado).default(""),
  consentimento: z.literal(true),
}) satisfies z.ZodType<Respostas, unknown>;
