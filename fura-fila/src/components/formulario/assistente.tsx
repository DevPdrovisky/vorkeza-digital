"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";
import { Paywall } from "@/components/paywall";
import { botaoPrimario } from "@/components/ui/estilos";
import { IconeCheck, IconeVoltar, IconeX } from "@/components/ui/icones";
import { Logo } from "@/components/ui/logo";
import { LIMITES } from "@/lib/config";
import {
  FAIXAS_RENDA,
  MORADORES,
  PORTES_PET,
  TEMPOS_EMPRESA,
  textoMoradores,
  textoPet,
  textoRenda,
  textoTempo,
  type Respostas,
} from "@/lib/dossie";
import { apenasDigitos, formatarTelefone, primeiroNome } from "@/lib/formatar";
import { prepararComprovante } from "@/lib/imagem";
import { AreaUpload, Caixa, CampoTexto, LETRAS, Opcoes } from "./campos";
import { Processando } from "./processando";

// ------------------------------------------------------------------ Estado

type Rascunho = {
  nome: string;
  idade: string;
  profissao: string;
  empresa: string;
  tempoEmpresa: string;
  email: string;
  whatsapp: string;
  pessoas: string;
  pet: string;
  faixaRenda: string;
  primeiraLocacao: boolean;
  refNome: string;
  refTelefone: string;
  refPeriodo: string;
  recado: string;
  consentimento: boolean;
};

const VAZIO: Rascunho = {
  nome: "",
  idade: "",
  profissao: "",
  empresa: "",
  tempoEmpresa: "",
  email: "",
  whatsapp: "",
  pessoas: "",
  pet: "",
  faixaRenda: "",
  primeiraLocacao: false,
  refNome: "",
  refTelefone: "",
  refPeriodo: "",
  recado: "",
  consentimento: false,
};

/** Rascunho salvo no navegador: se a pessoa sair e voltar, continua de onde parou. */
const CHAVE_RASCUNHO = "furafila:rascunho:v1";
const TEMPO_MINIMO_ANALISE = 3000;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const telefoneOk = (t: string) => [10, 11].includes(apenasDigitos(t).length);

// ------------------------------------------------------------------- Telas

type IdTela =
  | "nome"
  | "idade"
  | "profissao"
  | "tempoEmpresa"
  | "contato"
  | "pessoas"
  | "pet"
  | "faixaRenda"
  | "comprovantes"
  | "referencia"
  | "recado"
  | "revisao";

type Tela = {
  id: IdTela;
  etapa: 1 | 2 | 3;
  titulo: (r: Rascunho) => string;
  ajuda?: string;
  validar?: (r: Rascunho) => string | null;
};

const ETAPAS = { 1: "Dados pessoais", 2: "Família e pets", 3: "Renda e referências" } as const;

const TELAS: Tela[] = [
  {
    id: "nome",
    etapa: 1,
    titulo: () => "Vamos começar. Qual é o seu nome completo?",
    ajuda: "Do jeito que está no seu documento.",
    validar: (r) =>
      r.nome.trim().split(/\s+/).filter((p) => p.length > 1).length >= 2 ? null : "Digite nome e sobrenome.",
  },
  {
    id: "idade",
    etapa: 1,
    titulo: (r) => `Prazer, ${primeiroNome(r.nome) || "tudo bem"}! Quantos anos você tem?`,
    validar: (r) => {
      const n = Number(r.idade);
      return Number.isInteger(n) && n >= 18 && n <= 110 ? null : "Informe uma idade entre 18 e 110 anos.";
    },
  },
  {
    id: "profissao",
    etapa: 1,
    titulo: () => "Qual é a sua profissão?",
    ajuda: "Se quiser, conte também onde trabalha. Isso passa mais confiança.",
    validar: (r) => (r.profissao.trim().length >= 2 ? null : "Conte qual é a sua profissão."),
  },
  {
    id: "tempoEmpresa",
    etapa: 1,
    titulo: () => "Há quanto tempo você está nesse trabalho?",
    ajuda: "Autônomo ou empresário? Conte o tempo de atividade.",
    validar: (r) => (r.tempoEmpresa ? null : "Escolha uma opção."),
  },
  {
    id: "contato",
    etapa: 1,
    titulo: () => "Como o proprietário pode falar com você?",
    ajuda: "Esses contatos aparecem no dossiê. O e-mail também é o seu acesso ao PDF depois.",
    validar: (r) => {
      if (!EMAIL.test(r.email.trim())) return "Confira o seu e-mail.";
      if (!telefoneOk(r.whatsapp)) return "Informe o WhatsApp com DDD.";
      return null;
    },
  },
  {
    id: "pessoas",
    etapa: 2,
    titulo: () => "Quantas pessoas vão morar no imóvel, contando com você?",
    validar: (r) => (r.pessoas ? null : "Escolha uma opção."),
  },
  {
    id: "pet",
    etapa: 2,
    titulo: () => "Vai levar animal de estimação? Qual o porte?",
    ajuda: "Ser transparente aqui evita surpresa na vistoria e conta pontos.",
    validar: (r) => (r.pet ? null : "Escolha uma opção."),
  },
  {
    id: "faixaRenda",
    etapa: 3,
    titulo: () => "Qual é a renda mensal de quem vai pagar o aluguel?",
    ajuda: "Vai dividir as contas? Some a renda de todos.",
    validar: (r) => (r.faixaRenda ? null : "Escolha uma faixa."),
  },
  {
    id: "comprovantes",
    etapa: 3,
    titulo: () => "Quer anexar comprovantes de renda?",
    ajuda: "Opcional. Holerite, extrato bancário ou declaração de IR. Eles entram no final do seu dossiê.",
  },
  {
    id: "referencia",
    etapa: 3,
    titulo: () => "Quem foi o seu último locador?",
    ajuda: "Proprietário ou imobiliária do seu último aluguel. Uma boa referência pesa muito na aprovação.",
    validar: (r) => {
      if (r.primeiraLocacao) return null;
      if (r.refNome.trim().length < 2) return "Informe o nome do locador ou da imobiliária.";
      if (!telefoneOk(r.refTelefone)) return "Informe o telefone do locador com DDD.";
      return null;
    },
  },
  {
    id: "recado",
    etapa: 3,
    titulo: () => "Quer deixar um recado para o proprietário?",
    ajuda: "Opcional. Por que você quer o imóvel, sua rotina, quanto tempo pretende ficar.",
  },
  {
    id: "revisao",
    etapa: 3,
    titulo: (r) => `Tudo certo, ${primeiroNome(r.nome)}? Confira e gere o seu dossiê.`,
    validar: (r) => (r.consentimento ? null : "Marque a declaração para continuar."),
  },
];

const INDICE = Object.fromEntries(TELAS.map((t, i) => [t.id, i])) as Record<IdTela, number>;

/** Telas de múltipla escolha: atalhos de teclado A, B, C… */
const ESCOLHAS: Partial<Record<IdTela, { campo: keyof Rascunho; lista: readonly { id: string }[] }>> = {
  tempoEmpresa: { campo: "tempoEmpresa", lista: TEMPOS_EMPRESA },
  pessoas: { campo: "pessoas", lista: MORADORES },
  pet: { campo: "pet", lista: PORTES_PET },
  faixaRenda: { campo: "faixaRenda", lista: FAIXAS_RENDA },
};

function paraRespostas(r: Rascunho) {
  return {
    nome: r.nome.trim(),
    idade: Number(r.idade),
    profissao: r.profissao.trim(),
    empresa: r.empresa.trim(),
    tempoEmpresa: r.tempoEmpresa,
    email: r.email.trim(),
    whatsapp: r.whatsapp,
    pessoas: Number(r.pessoas),
    pet: r.pet,
    faixaRenda: r.faixaRenda,
    referencia: {
      primeiraLocacao: r.primeiraLocacao,
      nome: r.refNome.trim(),
      telefone: r.refTelefone,
      periodo: r.refPeriodo.trim(),
    },
    recado: r.recado.trim(),
    consentimento: r.consentimento,
  };
}

type Fase =
  | { tipo: "perguntas" }
  | { tipo: "processando" }
  | { tipo: "paywall"; id: string; respostas: Respostas; enviados: number; falhas: number };

// ------------------------------------------------------------- Componente

export function Assistente() {
  const [r, setR] = useState<Rascunho>(VAZIO);
  const [indice, setIndice] = useState(0);
  const [direcao, setDirecao] = useState<1 | -1>(1);
  const [erro, setErro] = useState<string | null>(null);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [preparando, setPreparando] = useState(false);
  const [fase, setFase] = useState<Fase>({ tipo: "perguntas" });
  const telaRef = useRef<HTMLDivElement>(null);
  const travado = useRef(false);
  // Estado (não ref): a gravação só pode rodar no render seguinte, já com o rascunho restaurado.
  const [carregou, setCarregou] = useState(false);

  const tela = TELAS[indice];
  const ultima = indice === TELAS.length - 1;
  const atualizar = (parcial: Partial<Rascunho>) => {
    setR((atual) => ({ ...atual, ...parcial }));
    setErro(null);
  };

  // Recupera o rascunho salvo (só existe no navegador, por isso fica num efeito).
  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_RASCUNHO) ?? "null");
      if (salvo?.r) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do localStorage após a hidratação
        setR({ ...VAZIO, ...salvo.r });
        setIndice(Math.min(Math.max(Number(salvo.indice) || 0, 0), TELAS.length - 1));
      }
    } catch {
      // armazenamento indisponível (aba anônima, bloqueio): segue sem rascunho
    }
    setCarregou(true);
  }, []);

  useEffect(() => {
    if (!carregou || fase.tipo !== "perguntas") return;
    try {
      localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify({ r, indice }));
    } catch {
      // sem armazenamento: o formulário continua funcionando
    }
  }, [carregou, r, indice, fase.tipo]);

  // Ao trocar de tela, coloca o foco no primeiro campo (ou no título, nas telas de escolha).
  useEffect(() => {
    if (fase.tipo !== "perguntas") return;
    const alvo =
      telaRef.current?.querySelector<HTMLElement>("[data-autofoco]") ?? telaRef.current?.querySelector<HTMLElement>("h1");
    alvo?.focus({ preventScroll: true });
  }, [indice, fase.tipo]);

  function irPara(novo: number) {
    setErro(null);
    setDirecao(novo < indice ? -1 : 1);
    setIndice(novo);
  }

  function avancar(base: Rascunho = r) {
    if (travado.current) return;
    const mensagem = tela.validar?.(base) ?? null;
    if (mensagem) {
      setErro(mensagem);
      return;
    }
    if (!ultima) {
      irPara(indice + 1);
      return;
    }
    // Revisão final: garante que nada ficou para trás (ex.: rascunho antigo incompleto).
    for (const [i, t] of TELAS.entries()) {
      const falha = t.validar?.(base);
      if (falha) {
        irPara(i);
        setErro(falha);
        return;
      }
    }
    void gerar(base);
  }

  function escolher(campo: keyof Rascunho, valor: string) {
    const novo = { ...r, [campo]: valor };
    setR(novo);
    setErro(null);
    travado.current = true;
    window.setTimeout(() => {
      travado.current = false;
      avancar(novo);
    }, 260);
  }

  async function adicionarArquivos(lista: FileList | null) {
    if (!lista?.length) return;
    setErro(null);
    setPreparando(true);
    const novos: File[] = [];
    try {
      for (const arquivo of Array.from(lista)) {
        if (arquivos.length + novos.length >= LIMITES.arquivos) {
          setErro(`Você pode anexar até ${LIMITES.arquivos} arquivos.`);
          break;
        }
        novos.push(await prepararComprovante(arquivo));
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível usar este arquivo.");
    } finally {
      setArquivos((atuais) => [...atuais, ...novos].slice(0, LIMITES.arquivos));
      setPreparando(false);
    }
  }

  async function gerar(base: Rascunho) {
    setFase({ tipo: "processando" });
    const inicio = Date.now();
    try {
      const res = await fetch("/api/dossie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respostas: paraRespostas(base) }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.erro ?? "Não foi possível salvar suas respostas.");

      let enviados = 0;
      for (const arquivo of arquivos) {
        const dados = new FormData();
        dados.append("arquivo", arquivo);
        const envio = await fetch(`/api/dossie/${json.id}/comprovantes`, { method: "POST", body: dados }).catch(
          () => null,
        );
        if (envio?.ok) enviados++;
      }

      const falta = TEMPO_MINIMO_ANALISE - (Date.now() - inicio);
      if (falta > 0) await new Promise((ok) => window.setTimeout(ok, falta));

      try {
        localStorage.removeItem(CHAVE_RASCUNHO);
      } catch {}
      // A URL passa a ser a do dossiê: se a pessoa recarregar, cai no paywall salvo.
      window.history.replaceState(null, "", `/dossie/${json.id}`);
      setFase({ tipo: "paywall", id: json.id, respostas: json.respostas, enviados, falhas: arquivos.length - enviados });
    } catch (e) {
      setFase({ tipo: "perguntas" });
      setErro(e instanceof Error ? e.message : "Erro inesperado. Tente de novo.");
    }
  }

  const aoTeclar = useEffectEvent((e: KeyboardEvent) => {
    if (fase.tipo !== "perguntas") return;
    const alvo = e.target as HTMLElement;
    const emTexto = alvo.tagName === "TEXTAREA";
    const emCampo = alvo.tagName === "INPUT" || emTexto;

    if (e.key === "Enter") {
      if (alvo.tagName === "BUTTON" || alvo.tagName === "A") return; // botão ativa a si mesmo
      if (emTexto && !(e.ctrlKey || e.metaKey)) return; // Enter quebra linha no recado
      e.preventDefault();
      const campos = Array.from(
        telaRef.current?.querySelectorAll<HTMLElement>("input:not([type=checkbox]):not([type=file]):not(:disabled), textarea") ?? [],
      );
      const posicao = campos.indexOf(alvo);
      if (posicao >= 0 && posicao < campos.length - 1) {
        campos[posicao + 1].focus();
        return;
      }
      avancar();
      return;
    }

    const escolha = ESCOLHAS[tela.id];
    if (escolha && !emCampo && !e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
      const i = LETRAS.indexOf(e.key.toUpperCase());
      if (i >= 0 && i < escolha.lista.length) {
        e.preventDefault();
        escolher(escolha.campo, escolha.lista[i].id);
      }
    }
  });

  useEffect(() => {
    const ouvir = (e: KeyboardEvent) => aoTeclar(e);
    window.addEventListener("keydown", ouvir);
    return () => window.removeEventListener("keydown", ouvir);
  }, []);

  // ------------------------------------------------------------- Fases

  if (fase.tipo === "processando") {
    return (
      <Moldura>
        <div className="flex flex-1 items-center justify-center py-10">
          <Processando />
        </div>
      </Moldura>
    );
  }

  if (fase.tipo === "paywall") {
    return (
      <Moldura>
        <div className="flex flex-1 items-center">
          <Paywall
            dossieId={fase.id}
            respostas={fase.respostas}
            qtdComprovantes={fase.enviados}
            falhasEnvio={fase.falhas}
          />
        </div>
      </Moldura>
    );
  }

  const progresso = ((indice + 1) / TELAS.length) * 100;

  return (
    <Moldura
      topo={
        <>
          <div className="h-1 w-full bg-slate-100" aria-hidden="true">
            <div className="h-full bg-marca-600 transition-[width] duration-500 ease-out" style={{ width: `${progresso}%` }} />
          </div>
          <p className="mx-auto max-w-2xl px-4 pt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 sm:px-6">
            Etapa {tela.etapa} de 3 · <span className="text-marca-700">{ETAPAS[tela.etapa]}</span>
          </p>
        </>
      }
    >
      <form
        className="flex flex-1 flex-col"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          avancar();
        }}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-8 sm:px-6">
          <div
            key={indice}
            ref={telaRef}
            className={direcao === 1 ? "animate-entrar-cima" : "animate-entrar-baixo"}
          >
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-marca-700">
              <span>{indice + 1}</span>
              <IconeSetaPequena />
            </p>
            <h1 tabIndex={-1} className="text-2xl font-bold leading-snug tracking-tight text-tinta-900 outline-none sm:text-[2rem]">
              {tela.titulo(r)}
            </h1>
            {tela.ajuda && <p className="mt-2 text-base text-slate-500 sm:text-lg">{tela.ajuda}</p>}

            <div className="mt-8">
              <ConteudoTela
                id={tela.id}
                r={r}
                atualizar={atualizar}
                escolher={escolher}
                arquivos={arquivos}
                preparando={preparando}
                adicionarArquivos={adicionarArquivos}
                removerArquivo={(i) => setArquivos((a) => a.filter((_, j) => j !== i))}
                irPara={irPara}
              />
            </div>

            {erro && (
              <p role="alert" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                {erro}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button type="submit" className={`${botaoPrimario} ${ultima ? "px-8 py-4 text-lg" : ""}`} disabled={preparando}>
                {ultima ? "Gerar meu dossiê" : textoBotao(tela.id, r, arquivos.length)}
                {!ultima && <IconeCheck className="h-4 w-4" />}
              </button>
              {!ultima && tela.id !== "recado" && (
                <span className="hidden text-sm text-slate-400 sm:inline">
                  ou pressione <kbd className="font-sans font-semibold text-slate-500">Enter ↵</kbd>
                </span>
              )}
              {tela.id === "recado" && (
                <span className="hidden text-sm text-slate-400 sm:inline">
                  <kbd className="font-sans font-semibold text-slate-500">Ctrl + Enter ↵</kbd> para continuar
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white/80">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => irPara(indice - 1)}
              disabled={indice === 0}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-tinta-900 disabled:invisible"
            >
              <IconeVoltar className="h-4 w-4" />
              Voltar
            </button>
            <span className="text-xs text-slate-400">
              {indice + 1} de {TELAS.length}
            </span>
          </div>
        </div>
      </form>
    </Moldura>
  );
}

function textoBotao(id: IdTela, r: Rascunho, qtdArquivos: number) {
  if (id === "comprovantes") return qtdArquivos > 0 ? "Continuar" : "Pular por enquanto";
  if (id === "recado") return r.recado.trim() ? "Continuar" : "Pular";
  return "OK";
}

function IconeSetaPequena() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Moldura({ children, topo }: { children: ReactNode; topo?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-white to-slate-50">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="Voltar para o início" className="rounded-lg">
            <Logo />
          </Link>
          <Link
            href="/"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-tinta-900"
            aria-label="Sair do formulário"
          >
            <IconeX />
          </Link>
        </div>
        {topo}
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}

// ------------------------------------------------------- Conteúdo de cada tela

function ConteudoTela({
  id,
  r,
  atualizar,
  escolher,
  arquivos,
  preparando,
  adicionarArquivos,
  removerArquivo,
  irPara,
}: {
  id: IdTela;
  r: Rascunho;
  atualizar: (p: Partial<Rascunho>) => void;
  escolher: (campo: keyof Rascunho, valor: string) => void;
  arquivos: File[];
  preparando: boolean;
  adicionarArquivos: (lista: FileList | null) => void;
  removerArquivo: (i: number) => void;
  irPara: (i: number) => void;
}) {
  switch (id) {
    case "nome":
      return (
        <CampoTexto
          id="nome"
          foco
          valor={r.nome}
          aoMudar={(nome) => atualizar({ nome })}
          placeholder="Digite seu nome completo"
          autoComplete="name"
          autoCapitalize="words"
          maxLength={120}
        />
      );
    case "idade":
      return (
        <CampoTexto
          id="idade"
          foco
          valor={r.idade}
          aoMudar={(v) => atualizar({ idade: apenasDigitos(v).slice(0, 3) })}
          placeholder="Ex.: 32"
          inputMode="numeric"
          autoComplete="off"
        />
      );
    case "profissao":
      return (
        <div className="space-y-6">
          <CampoTexto
            id="profissao"
            foco
            valor={r.profissao}
            aoMudar={(profissao) => atualizar({ profissao })}
            placeholder="Ex.: Enfermeira, Analista de sistemas"
            autoComplete="organization-title"
            maxLength={80}
          />
          <CampoTexto
            id="empresa"
            tamanho="medio"
            rotulo="Empresa onde trabalha (opcional)"
            valor={r.empresa}
            aoMudar={(empresa) => atualizar({ empresa })}
            placeholder="Ex.: Hospital Santa Clara"
            autoComplete="organization"
            maxLength={80}
          />
        </div>
      );
    case "tempoEmpresa":
      return (
        <Opcoes
          rotulo="Tempo no trabalho atual"
          opcoes={TEMPOS_EMPRESA}
          valor={r.tempoEmpresa}
          aoEscolher={(v) => escolher("tempoEmpresa", v)}
        />
      );
    case "contato":
      return (
        <div className="space-y-6">
          <CampoTexto
            id="email"
            foco
            tamanho="medio"
            rotulo="E-mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            valor={r.email}
            aoMudar={(email) => atualizar({ email })}
            placeholder="voce@email.com"
            maxLength={160}
          />
          <CampoTexto
            id="whatsapp"
            tamanho="medio"
            rotulo="WhatsApp com DDD"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            valor={r.whatsapp}
            aoMudar={(v) => atualizar({ whatsapp: formatarTelefone(v) })}
            placeholder="(11) 98765-4321"
          />
        </div>
      );
    case "pessoas":
      return (
        <Opcoes rotulo="Moradores" opcoes={MORADORES} valor={r.pessoas} aoEscolher={(v) => escolher("pessoas", v)} />
      );
    case "pet":
      return (
        <Opcoes
          rotulo="Animal de estimação"
          opcoes={PORTES_PET.map((p) => ({ id: p.id, rotulo: p.rotulo, detalhe: p.id === "nenhum" ? undefined : p.detalhe }))}
          valor={r.pet}
          aoEscolher={(v) => escolher("pet", v)}
        />
      );
    case "faixaRenda":
      return (
        <Opcoes
          rotulo="Faixa de renda mensal"
          opcoes={FAIXAS_RENDA.map((f) => ({ id: f.id, rotulo: textoRenda(f.id) }))}
          valor={r.faixaRenda}
          aoEscolher={(v) => escolher("faixaRenda", v)}
        />
      );
    case "comprovantes":
      return (
        <AreaUpload
          arquivos={arquivos}
          limite={LIMITES.arquivos}
          preparando={preparando}
          aoAdicionar={adicionarArquivos}
          aoRemover={removerArquivo}
        />
      );
    case "referencia":
      return (
        <div className="space-y-6">
          <Caixa marcado={r.primeiraLocacao} aoMudar={(primeiraLocacao) => atualizar({ primeiraLocacao })}>
            <strong className="font-semibold text-tinta-900">Este é o meu primeiro aluguel.</strong> Sem problema:
            o dossiê destaca sua renda e seu vínculo profissional.
          </Caixa>
          {!r.primeiraLocacao && (
            <>
              <CampoTexto
                id="refNome"
                foco
                tamanho="medio"
                rotulo="Nome do proprietário ou da imobiliária"
                valor={r.refNome}
                aoMudar={(refNome) => atualizar({ refNome })}
                placeholder="Ex.: Imobiliária Central"
                maxLength={120}
              />
              <CampoTexto
                id="refTelefone"
                tamanho="medio"
                rotulo="Telefone com DDD"
                type="tel"
                inputMode="tel"
                valor={r.refTelefone}
                aoMudar={(v) => atualizar({ refTelefone: formatarTelefone(v) })}
                placeholder="(11) 3333-4444"
              />
              <CampoTexto
                id="refPeriodo"
                tamanho="medio"
                rotulo="Quando você morou lá? (opcional)"
                valor={r.refPeriodo}
                aoMudar={(refPeriodo) => atualizar({ refPeriodo })}
                placeholder="Ex.: 2021 a 2024"
                maxLength={60}
              />
            </>
          )}
        </div>
      );
    case "recado":
      return (
        <div>
          <textarea
            data-autofoco=""
            value={r.recado}
            onChange={(e) => atualizar({ recado: e.target.value.slice(0, LIMITES.recado) })}
            rows={4}
            placeholder="Ex.: Somos um casal tranquilo, trabalhamos perto e queremos ficar pelo menos 3 anos."
            className="w-full resize-none rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg text-tinta-900 caret-marca-600 placeholder:text-slate-300 focus:border-marca-600 focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {r.recado.length}/{LIMITES.recado}
          </p>
        </div>
      );
    case "revisao":
      return <Revisao r={r} qtdArquivos={arquivos.length} atualizar={atualizar} irPara={irPara} />;
  }
}

function Revisao({
  r,
  qtdArquivos,
  atualizar,
  irPara,
}: {
  r: Rascunho;
  qtdArquivos: number;
  atualizar: (p: Partial<Rascunho>) => void;
  irPara: (i: number) => void;
}) {
  const linhas: [string, string, IdTela][] = [
    ["Nome", r.nome, "nome"],
    ["Idade", r.idade ? `${r.idade} anos` : "—", "idade"],
    ["Profissão", r.empresa ? `${r.profissao} · ${r.empresa}` : r.profissao, "profissao"],
    ["Tempo no trabalho", r.tempoEmpresa ? textoTempo(r.tempoEmpresa) : "—", "tempoEmpresa"],
    ["Contato", [r.email, r.whatsapp].filter(Boolean).join(" · "), "contato"],
    ["Moradores", r.pessoas ? textoMoradores(Number(r.pessoas)) : "—", "pessoas"],
    ["Pet", r.pet ? textoPet(r.pet) : "—", "pet"],
    ["Renda mensal", r.faixaRenda ? textoRenda(r.faixaRenda) : "—", "faixaRenda"],
    ["Comprovantes", qtdArquivos ? `${qtdArquivos} anexado(s)` : "Nenhum", "comprovantes"],
    [
      "Referência",
      r.primeiraLocacao ? "Primeira locação" : [r.refNome, r.refTelefone].filter(Boolean).join(" · ") || "—",
      "referencia",
    ],
  ];

  return (
    <div className="space-y-5">
      <dl className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {linhas.map(([rotulo, valor, tela]) => (
          <div key={rotulo} className="flex items-center gap-3 px-4 py-2.5 text-sm">
            <dt className="w-32 shrink-0 text-slate-500">{rotulo}</dt>
            <dd className="min-w-0 flex-1 truncate font-medium text-tinta-900">{valor || "—"}</dd>
            <button
              type="button"
              onClick={() => irPara(INDICE[tela])}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-marca-700 hover:bg-marca-50"
            >
              Editar
            </button>
          </div>
        ))}
      </dl>
      <Caixa foco marcado={r.consentimento} aoMudar={(consentimento) => atualizar({ consentimento })}>
        Declaro que as informações são verdadeiras e autorizo o uso dos meus dados para gerar o dossiê, conforme
        a LGPD.
      </Caixa>
    </div>
  );
}
