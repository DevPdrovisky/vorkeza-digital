import "server-only";
import { randomInt, randomUUID } from "node:crypto";
import { bucketComprovantes, demoBanco, supabaseConfigurado } from "./ambiente";
import type { Respostas } from "./dossie";
import { supabaseAdmin } from "./supabase/admin";

// Camada de acesso a dados. As rotas e páginas falam só com esta interface;
// a implementação é o Supabase (produção) ou a memória do servidor (modo demonstração local).

export type StatusDossie = "pendente" | "pago";

export type Comprovante = {
  id: string;
  caminho: string;
  nome: string;
  tipo: string;
  tamanho: number;
};

export type Dossie = {
  id: string;
  codigo: string;
  criadoEm: Date;
  status: StatusDossie;
  nome: string;
  email: string;
  respostas: Respostas;
  aceiteEm: Date;
  pagoEm: Date | null;
  stripeSessionId: string | null;
  comprovantes: Comprovante[];
};

export type DadosPagamento = {
  sessionId: string;
  paymentIntent: string | null;
  emailPagador: string | null;
  valorCentavos: number | null;
};

export interface Repositorio {
  criar(respostas: Respostas): Promise<Dossie>;
  buscar(id: string): Promise<Dossie | null>;
  buscarPorCodigo(codigo: string): Promise<Dossie | null>;
  registrarSessao(id: string, sessionId: string): Promise<void>;
  /** Idempotente: chamar duas vezes (webhook + página de sucesso) não causa problema. */
  marcarPago(id: string, pagamento: DadosPagamento): Promise<void>;
  adicionarComprovante(
    id: string,
    arquivo: { nome: string; tipo: string; bytes: Uint8Array },
  ): Promise<Comprovante>;
  baixarComprovante(caminho: string): Promise<Uint8Array | null>;
}

// Código de autenticidade impresso no PDF: FF-XXXXX-XXXXX, sem caracteres ambíguos (0/O, 1/I/L).
const ALFABETO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export function gerarCodigo() {
  let s = "";
  for (let i = 0; i < 10; i++) s += ALFABETO[randomInt(ALFABETO.length)];
  return `FF-${s.slice(0, 5)}-${s.slice(5)}`;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const idValido = (id: string) => UUID.test(id);

const EXTENSAO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

// ---------------------------------------------------------------- Supabase

type LinhaDossie = {
  id: string;
  codigo: string;
  created_at: string;
  status: StatusDossie;
  nome: string;
  email: string;
  respostas: Respostas;
  aceite_em: string;
  pago_em: string | null;
  stripe_session_id: string | null;
  comprovantes: (Comprovante & { created_at: string })[] | null;
};

const COLUNAS =
  "id, codigo, created_at, status, nome, email, respostas, aceite_em, pago_em, stripe_session_id, comprovantes(id, caminho, nome, tipo, tamanho, created_at)";

function daLinha(l: LinhaDossie): Dossie {
  return {
    id: l.id,
    codigo: l.codigo,
    criadoEm: new Date(l.created_at),
    status: l.status,
    nome: l.nome,
    email: l.email,
    respostas: l.respostas,
    aceiteEm: new Date(l.aceite_em),
    pagoEm: l.pago_em ? new Date(l.pago_em) : null,
    stripeSessionId: l.stripe_session_id,
    comprovantes: (l.comprovantes ?? [])
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map(({ id, caminho, nome, tipo, tamanho }) => ({ id, caminho, nome, tipo, tamanho })),
  };
}

const repositorioSupabase: Repositorio = {
  async criar(respostas) {
    for (let tentativa = 0; tentativa < 3; tentativa++) {
      const { data, error } = await supabaseAdmin()
        .from("dossies")
        .insert({ codigo: gerarCodigo(), nome: respostas.nome, email: respostas.email, respostas })
        .select(COLUNAS)
        .single<LinhaDossie>();
      if (!error) return daLinha(data);
      if (error.code !== "23505") throw new Error(`Supabase: ${error.message}`); // 23505 = código repetido
    }
    throw new Error("Não foi possível gerar um código único.");
  },

  async buscar(id) {
    if (!idValido(id)) return null;
    const { data, error } = await supabaseAdmin()
      .from("dossies")
      .select(COLUNAS)
      .eq("id", id)
      .maybeSingle<LinhaDossie>();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return data ? daLinha(data) : null;
  },

  async buscarPorCodigo(codigo) {
    const { data, error } = await supabaseAdmin()
      .from("dossies")
      .select(COLUNAS)
      .eq("codigo", codigo)
      .maybeSingle<LinhaDossie>();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return data ? daLinha(data) : null;
  },

  async registrarSessao(id, sessionId) {
    const { error } = await supabaseAdmin()
      .from("dossies")
      .update({ stripe_session_id: sessionId })
      .eq("id", id);
    if (error) throw new Error(`Supabase: ${error.message}`);
  },

  async marcarPago(id, p) {
    const { error } = await supabaseAdmin()
      .from("dossies")
      .update({
        status: "pago",
        pago_em: new Date().toISOString(),
        stripe_session_id: p.sessionId,
        stripe_payment_intent: p.paymentIntent,
        email_pagador: p.emailPagador,
        valor_centavos: p.valorCentavos,
      })
      .eq("id", id)
      .eq("status", "pendente");
    if (error) throw new Error(`Supabase: ${error.message}`);
  },

  async adicionarComprovante(id, arquivo) {
    const caminho = `${id}/${randomUUID()}.${EXTENSAO[arquivo.tipo] ?? "bin"}`;
    const banco = supabaseAdmin();
    const envio = await banco.storage
      .from(bucketComprovantes())
      .upload(caminho, arquivo.bytes, { contentType: arquivo.tipo, upsert: false });
    if (envio.error) throw new Error(`Supabase Storage: ${envio.error.message}`);
    const { data, error } = await banco
      .from("comprovantes")
      .insert({
        dossie_id: id,
        caminho,
        nome: arquivo.nome,
        tipo: arquivo.tipo,
        tamanho: arquivo.bytes.byteLength,
      })
      .select("id, caminho, nome, tipo, tamanho")
      .single<Comprovante>();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return data;
  },

  async baixarComprovante(caminho) {
    const { data, error } = await supabaseAdmin().storage.from(bucketComprovantes()).download(caminho);
    if (error || !data) return null;
    return new Uint8Array(await data.arrayBuffer());
  },
};

// ------------------------------------------------- Memória (demonstração local)

type Memoria = { dossies: Map<string, Dossie>; arquivos: Map<string, Uint8Array> };
const global = globalThis as typeof globalThis & { __furaFilaMemoria?: Memoria };
const memoria = (global.__furaFilaMemoria ??= { dossies: new Map(), arquivos: new Map() });
const copia = (d: Dossie): Dossie => structuredClone(d);

const repositorioMemoria: Repositorio = {
  async criar(respostas) {
    const agora = new Date();
    const dossie: Dossie = {
      id: randomUUID(),
      codigo: gerarCodigo(),
      criadoEm: agora,
      status: "pendente",
      nome: respostas.nome,
      email: respostas.email,
      respostas,
      aceiteEm: agora,
      pagoEm: null,
      stripeSessionId: null,
      comprovantes: [],
    };
    memoria.dossies.set(dossie.id, dossie);
    return copia(dossie);
  },
  async buscar(id) {
    const d = memoria.dossies.get(id);
    return d ? copia(d) : null;
  },
  async buscarPorCodigo(codigo) {
    for (const d of memoria.dossies.values()) if (d.codigo === codigo) return copia(d);
    return null;
  },
  async registrarSessao(id, sessionId) {
    const d = memoria.dossies.get(id);
    if (d) d.stripeSessionId = sessionId;
  },
  async marcarPago(id, p) {
    const d = memoria.dossies.get(id);
    if (!d || d.status === "pago") return;
    d.status = "pago";
    d.pagoEm = new Date();
    d.stripeSessionId = p.sessionId;
  },
  async adicionarComprovante(id, arquivo) {
    const d = memoria.dossies.get(id);
    if (!d) throw new Error("Dossiê não encontrado.");
    const comprovante: Comprovante = {
      id: randomUUID(),
      caminho: `${id}/${randomUUID()}.${EXTENSAO[arquivo.tipo] ?? "bin"}`,
      nome: arquivo.nome,
      tipo: arquivo.tipo,
      tamanho: arquivo.bytes.byteLength,
    };
    memoria.arquivos.set(comprovante.caminho, arquivo.bytes);
    d.comprovantes.push(comprovante);
    return { ...comprovante };
  },
  async baixarComprovante(caminho) {
    return memoria.arquivos.get(caminho) ?? null;
  },
};

export function repositorio(): Repositorio {
  if (supabaseConfigurado()) return repositorioSupabase;
  if (demoBanco()) return repositorioMemoria;
  throw new Error(
    "Supabase não configurado. Preencha NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY.",
  );
}
