// Template visual do Dossiê do Inquilino (@react-pdf/renderer).
// Componente só de apresentação: recebe os dados prontos e não acessa banco nem rede.
// Para ver alterações na hora, rode `npm run dev` e abra http://localhost:3000/api/pdf-exemplo

import {
  Document,
  Image,
  Link,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { PRODUTO, RODAPE_B2B, linkVitrineImovel } from "@/lib/config";
import {
  opcao,
  PORTES_PET,
  pontosFortes,
  resumoExecutivo,
  textoCapacidade,
  textoMoradores,
  textoPet,
  textoRenda,
  textoTempo,
  type Respostas,
} from "@/lib/dossie";
import { dataHora, dataPorExtenso, formatarTelefone } from "@/lib/formatar";

export const A4 = { largura: 595.28, altura: 841.89 };
const MARGEM = 44;

/** Área onde cada comprovante é desenhado nas páginas de anexo (em pontos, origem no topo). */
export const CAIXA_ANEXO = {
  topo: 112,
  esquerda: MARGEM,
  largura: A4.largura - MARGEM * 2,
  altura: A4.altura - 112 - 80,
};

export type PaginaAnexo = {
  numero: number;
  nome: string;
  /** Ex.: "Página 2 de 3" quando o comprovante é um PDF com várias páginas. */
  parte?: string;
  imagem?: { data: Buffer; format: "png" | "jpg" };
  /** Página de PDF: o espaço fica reservado e o pdf-lib desenha a página original dentro dele. */
  reservada?: boolean;
  aviso?: string;
};

export type DadosDossiePDF = {
  codigo: string;
  emitidoEm: Date;
  aceiteEm: Date;
  respostas: Respostas;
  comprovantes: { nome: string }[];
  urlVerificacao: string;
  /** QR Code (data URL PNG) que leva à página de verificação. */
  qrCode: string;
  anexos: PaginaAnexo[];
};

const COR = {
  tinta: "#0B1F3A",
  tintaMedia: "#1B3A63",
  tintaClara: "#A9BCD6",
  marca: "#0F9D6E",
  marcaClara: "#E8F6F0",
  marcaBorda: "#BFE6D6",
  marcaTexto: "#0B7A55",
  marcaNoEscuro: "#6EE7B7",
  texto: "#1E293B",
  suave: "#64748B",
  muitoSuave: "#94A3B8",
  linha: "#E2E8F0",
  linhaLeve: "#EEF2F6",
  fundo: "#F8FAFC",
  branco: "#FFFFFF",
};

const s = StyleSheet.create({
  pagina: {
    paddingTop: 44,
    paddingBottom: 74,
    paddingHorizontal: MARGEM,
    fontFamily: "Inter",
    fontSize: 9.5,
    color: COR.texto,
    // Atenção: não defina lineHeight aqui. Herdado pela página, ele faz o react-pdf
    // descartar o texto fixo do rodapé (que fica dentro da margem inferior).
  },

  // Cabeçalho da primeira página
  faixa: {
    backgroundColor: COR.tinta,
    marginTop: -44,
    marginHorizontal: -MARGEM,
    paddingHorizontal: MARGEM,
    paddingTop: 30,
    paddingBottom: 26,
  },
  faixaAcento: { position: "absolute", top: 0, left: 0, right: 0, height: 4, backgroundColor: COR.marca },
  faixaTopo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  rotuloDoc: { fontSize: 7.5, fontWeight: 700, letterSpacing: 1.8, color: COR.marcaNoEscuro },
  marcaTopo: { fontSize: 7.5, fontWeight: 600, color: COR.tintaClara, letterSpacing: 0.4 },
  faixaCorpo: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  faixaEsquerda: { flex: 1, paddingRight: 20 },
  nome: { fontSize: 24, fontWeight: 700, color: COR.branco, letterSpacing: -0.3, lineHeight: 1.15 },
  cargo: { fontSize: 10.5, color: "#C7D4E6", marginTop: 5 },
  chips: { flexDirection: "row", flexWrap: "wrap", marginTop: 13 },
  chip: {
    fontSize: 7.5,
    fontWeight: 500,
    color: COR.branco,
    backgroundColor: COR.tintaMedia,
    borderRadius: 9,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginRight: 5,
    marginBottom: 4,
  },
  qrCaixa: { backgroundColor: COR.branco, borderRadius: 6, paddingTop: 7, paddingHorizontal: 7, paddingBottom: 5, alignItems: "center" },
  qr: { width: 62, height: 62 },
  qrLegenda: { fontSize: 5.5, fontWeight: 600, color: COR.suave, marginTop: 4, letterSpacing: 0.4 },

  // Linha de metadados
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 0.75,
    borderBottomColor: COR.linha,
    marginBottom: 18,
  },
  metaItem: { fontSize: 7.5, color: COR.suave },
  metaForte: { fontWeight: 600, color: COR.texto },

  // Seções
  secao: { marginBottom: 16 },
  secaoTitulo: {
    fontSize: 7.5,
    fontWeight: 700,
    color: COR.marcaTexto,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    marginBottom: 7,
    paddingBottom: 4,
    borderBottomWidth: 0.75,
    borderBottomColor: COR.linha,
  },
  paragrafo: { fontSize: 10, lineHeight: 1.6 },

  // Indicadores
  indicadores: { flexDirection: "row", marginBottom: 18 },
  indicador: {
    flex: 1,
    borderWidth: 0.75,
    borderColor: COR.linha,
    borderRadius: 6,
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: COR.fundo,
  },
  indicadorDestaque: { backgroundColor: COR.marcaClara, borderColor: COR.marcaBorda },
  indicadorRotulo: { fontSize: 6.5, fontWeight: 600, color: COR.suave, letterSpacing: 0.6, textTransform: "uppercase" },
  indicadorValor: { fontSize: 11.5, fontWeight: 700, color: COR.tinta, marginTop: 5, lineHeight: 1.2 },
  indicadorNota: { fontSize: 7, color: COR.suave, marginTop: 3 },

  // Pontos fortes
  pontos: { flexDirection: "row", flexWrap: "wrap" },
  ponto: { width: "50%", flexDirection: "row", alignItems: "flex-start", marginBottom: 6, paddingRight: 12 },
  pontoIcone: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COR.marcaClara,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
    marginTop: 0.5,
  },
  pontoTexto: { fontSize: 9, flex: 1, lineHeight: 1.4 },

  // Duas colunas de dados
  colunas: { flexDirection: "row" },
  coluna: { flex: 1 },
  linha: { flexDirection: "row", paddingVertical: 4.5, borderBottomWidth: 0.5, borderBottomColor: COR.linhaLeve },
  linhaRotulo: { width: 96, fontSize: 8, color: COR.suave },
  linhaValor: { flex: 1, fontSize: 9, fontWeight: 500 },
  observacao: { fontSize: 8, color: COR.suave, marginTop: 6, lineHeight: 1.45 },

  // Recado
  recado: {
    backgroundColor: COR.fundo,
    borderLeftWidth: 2.5,
    borderLeftColor: COR.marca,
    paddingVertical: 10,
    paddingHorizontal: 13,
  },
  recadoTexto: { fontSize: 9.5, fontStyle: "italic", lineHeight: 1.6 },
  recadoAutor: { fontSize: 8, color: COR.suave, marginTop: 6 },

  // Declaração e autenticidade
  quadro: { borderWidth: 0.75, borderColor: COR.linha, borderRadius: 6, padding: 12 },
  quadroTitulo: { fontSize: 9, fontWeight: 700, color: COR.tinta, marginBottom: 4 },
  quadroTexto: { fontSize: 8, color: COR.texto, lineHeight: 1.5 },
  assinatura: { marginTop: 10, paddingTop: 6, borderTopWidth: 0.75, borderTopColor: COR.linha },
  assinaturaNome: { fontSize: 9, fontWeight: 600 },
  assinaturaInfo: { fontSize: 7, color: COR.suave, marginTop: 1 },
  codigo: { fontSize: 11, fontWeight: 700, color: COR.tinta, letterSpacing: 0.8, marginVertical: 4 },
  link: { fontSize: 7.5, color: COR.marcaTexto, textDecoration: "none" },
  nota: { fontSize: 7, color: COR.muitoSuave, lineHeight: 1.5, marginTop: 4 },

  // Elementos fixos em todas as páginas
  cabecalhoContinuo: {
    position: "absolute",
    top: 20,
    left: MARGEM,
    right: MARGEM,
    fontSize: 6.5,
    fontWeight: 600,
    color: COR.muitoSuave,
    letterSpacing: 0.8,
  },
  rodape: {
    position: "absolute",
    bottom: 26,
    left: MARGEM,
    right: MARGEM,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: COR.linha,
    paddingTop: 8,
  },
  rodapeTexto: { fontSize: 6.5, color: COR.muitoSuave, textDecoration: "none", maxWidth: 440 },
  rodapePagina: { fontSize: 6.5, color: COR.muitoSuave },

  // Páginas de anexo
  anexoCabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 8,
    borderBottomWidth: 0.75,
    borderBottomColor: COR.linha,
  },
  anexoRotulo: { fontSize: 7.5, fontWeight: 700, letterSpacing: 1.3, color: COR.marcaTexto },
  anexoNome: { fontSize: 11, fontWeight: 600, color: COR.tinta, marginTop: 3, maxWidth: 380 },
  anexoParte: { fontSize: 8, color: COR.suave },
  anexoCaixa: {
    position: "absolute",
    top: CAIXA_ANEXO.topo,
    left: CAIXA_ANEXO.esquerda,
    width: CAIXA_ANEXO.largura,
    height: CAIXA_ANEXO.altura,
    alignItems: "center",
    justifyContent: "center",
  },
  anexoImagem: { width: "100%", height: "100%", objectFit: "contain" },
  anexoAviso: { fontSize: 9, color: COR.suave, textAlign: "center", maxWidth: 300 },
});

// ----------------------------------------------------------- Peças reutilizáveis

function Rodape() {
  return (
    <View fixed style={s.rodape}>
      <Link src={linkVitrineImovel("pdf")} style={s.rodapeTexto}>
        {RODAPE_B2B}
      </Link>
      <Text
        style={s.rodapePagina}
        render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
      />
    </View>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={s.secao} wrap={false}>
      <Text style={s.secaoTitulo}>{titulo}</Text>
      {children}
    </View>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={s.linha}>
      <Text style={s.linhaRotulo}>{rotulo}</Text>
      <Text style={s.linhaValor}>{valor}</Text>
    </View>
  );
}

function Indicador({
  rotulo,
  valor,
  nota,
  destaque,
  ultimo,
}: {
  rotulo: string;
  valor: string;
  nota: string;
  destaque?: boolean;
  ultimo?: boolean;
}) {
  return (
    <View style={[s.indicador, destaque ? s.indicadorDestaque : {}, ultimo ? {} : { marginRight: 8 }]}>
      <Text style={s.indicadorRotulo}>{rotulo}</Text>
      <Text style={s.indicadorValor}>{valor}</Text>
      <Text style={s.indicadorNota}>{nota}</Text>
    </View>
  );
}

function Check() {
  return (
    <View style={s.pontoIcone}>
      <Svg width={7} height={7} viewBox="0 0 24 24">
        <Path
          d="M4.5 12.5l5 5L19.5 7"
          stroke={COR.marca}
          strokeWidth={3.4}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

function Colunas({ esquerda, direita }: { esquerda: ReactNode; direita: ReactNode }) {
  return (
    <View style={s.colunas} wrap={false}>
      <View style={[s.coluna, { marginRight: 20 }]}>{esquerda}</View>
      <View style={s.coluna}>{direita}</View>
    </View>
  );
}

// ------------------------------------------------------------------- Documento

export function DossiePDF({ dados }: { dados: DadosDossiePDF }) {
  const r = dados.respostas;
  const qtd = dados.comprovantes.length;
  const pet = opcao(PORTES_PET, r.pet);
  const cargo = r.empresa ? `${r.profissao}  ·  ${r.empresa}` : r.profissao;

  return (
    <Document
      title={`${PRODUTO.documento} — ${r.nome}`}
      author={PRODUTO.nome}
      subject={`${PRODUTO.documento} de ${r.nome} · Código ${dados.codigo}`}
      keywords="dossiê do inquilino, locação, aluguel, fura-fila"
      creator={PRODUTO.nome}
      producer={PRODUTO.nome}
      language="pt-BR"
    >
      <Page size="A4" style={s.pagina}>
        <Text
          fixed
          style={s.cabecalhoContinuo}
          render={({ pageNumber }) =>
            pageNumber > 1 ? `${PRODUTO.documento.toUpperCase()}  ·  ${r.nome.toUpperCase()}  ·  ${dados.codigo}` : ""
          }
        />

        <View style={s.faixa}>
          <View style={s.faixaAcento} />
          <View style={s.faixaTopo}>
            <Text style={s.rotuloDoc}>{PRODUTO.documento.toUpperCase()}</Text>
            <Text style={s.marcaTopo}>{PRODUTO.nome}</Text>
          </View>
          <View style={s.faixaCorpo}>
            <View style={s.faixaEsquerda}>
              <Text style={s.nome}>{r.nome}</Text>
              <Text style={s.cargo}>{cargo}</Text>
              <View style={s.chips}>
                <Text style={s.chip}>{r.idade} anos</Text>
                <Text style={s.chip}>{textoMoradores(r.pessoas)}</Text>
                <Text style={s.chip}>{pet.id === "nenhum" ? "Sem pets" : `Pet ${pet.rotulo.toLowerCase()}`}</Text>
                {qtd > 0 && (
                  <Text style={s.chip}>{qtd === 1 ? "1 comprovante" : `${qtd} comprovantes`}</Text>
                )}
              </View>
            </View>
            <Link src={dados.urlVerificacao} style={{ textDecoration: "none" }}>
              <View style={s.qrCaixa}>
                {/* eslint-disable-next-line jsx-a11y/alt-text -- Image do react-pdf não tem alt */}
                <Image src={dados.qrCode} style={s.qr} />
                <Text style={s.qrLegenda}>VERIFICAR AUTENTICIDADE</Text>
              </View>
            </Link>
          </View>
        </View>

        <View style={s.meta}>
          <Text style={s.metaItem}>
            Emitido em <Text style={s.metaForte}>{dataPorExtenso(dados.emitidoEm)}</Text>
          </Text>
          <Text style={s.metaItem}>
            Código de autenticidade <Text style={s.metaForte}>{dados.codigo}</Text>
          </Text>
        </View>

        <Secao titulo="Resumo executivo">
          <Text style={s.paragrafo}>{resumoExecutivo(r, qtd)}</Text>
        </Secao>

        <View style={s.indicadores} wrap={false}>
          <Indicador rotulo="Renda mensal" valor={textoRenda(r.faixaRenda, "curto")} nota="Faixa declarada" />
          <Indicador
            rotulo="Aluguel compatível*"
            valor={textoCapacidade(r.faixaRenda, "curto")}
            nota="Até 30% da renda"
            destaque
          />
          <Indicador rotulo="Vínculo profissional" valor={textoTempo(r.tempoEmpresa, "curto")} nota="No trabalho atual" />
          <Indicador
            rotulo="Moradores"
            valor={textoMoradores(r.pessoas)}
            nota={pet.id === "nenhum" ? "Sem animais" : `Pet de ${pet.rotulo.toLowerCase()}`}
            ultimo
          />
        </View>

        <Secao titulo="Pontos fortes do perfil">
          <View style={s.pontos}>
            {pontosFortes(r, qtd).map((p) => (
              <View key={p} style={s.ponto}>
                <Check />
                <Text style={s.pontoTexto}>{p}</Text>
              </View>
            ))}
          </View>
        </Secao>

        <Colunas
          esquerda={
            <Secao titulo="Dados do candidato">
              <Linha rotulo="Nome completo" valor={r.nome} />
              <Linha rotulo="Idade" valor={`${r.idade} anos`} />
              <Linha rotulo="E-mail" valor={r.email} />
              <Linha rotulo="WhatsApp" valor={formatarTelefone(r.whatsapp)} />
            </Secao>
          }
          direita={
            <Secao titulo="Perfil profissional">
              <Linha rotulo="Profissão" valor={r.profissao} />
              <Linha rotulo="Empresa" valor={r.empresa || "Não informada"} />
              <Linha rotulo="Tempo no trabalho" valor={textoTempo(r.tempoEmpresa)} />
            </Secao>
          }
        />

        <Colunas
          esquerda={
            <Secao titulo="Composição do lar">
              <Linha rotulo="Moradores" valor={textoMoradores(r.pessoas)} />
              <Linha rotulo="Animais" valor={textoPet(r.pet)} />
            </Secao>
          }
          direita={
            <Secao titulo="Capacidade financeira">
              <Linha rotulo="Renda mensal" valor={textoRenda(r.faixaRenda)} />
              <Linha rotulo="Aluguel compatível*" valor={textoCapacidade(r.faixaRenda)} />
              <Linha
                rotulo="Comprovantes"
                valor={qtd === 0 ? "Não anexados" : qtd === 1 ? "1 anexado" : `${qtd} anexados`}
              />
            </Secao>
          }
        />

        <Colunas
          esquerda={
            <Secao titulo="Referência de locação">
              {r.referencia.primeiraLocacao ? (
                <>
                  <Linha rotulo="Histórico" valor="Primeira locação" />
                  <Text style={s.observacao}>
                    O candidato ainda não alugou imóvel. Renda e vínculo profissional estão detalhados neste dossiê.
                  </Text>
                </>
              ) : (
                <>
                  <Linha rotulo="Locador anterior" valor={r.referencia.nome} />
                  <Linha rotulo="Telefone" valor={formatarTelefone(r.referencia.telefone)} />
                  <Linha rotulo="Período" valor={r.referencia.periodo || "Não informado"} />
                </>
              )}
            </Secao>
          }
          direita={
            <Secao titulo="Documentos anexados">
              {qtd === 0 ? (
                <Text style={s.observacao}>Nenhum comprovante foi anexado a este dossiê.</Text>
              ) : (
                dados.comprovantes.map((c, i) => (
                  <Linha key={`${i}-${c.nome}`} rotulo={`Anexo ${i + 1}`} valor={c.nome} />
                ))
              )}
            </Secao>
          }
        />

        {r.recado ? (
          <Secao titulo="Apresentação do candidato">
            <View style={s.recado}>
              <Text style={s.recadoTexto}>“{r.recado}”</Text>
              <Text style={s.recadoAutor}>— {r.nome}</Text>
            </View>
          </Secao>
        ) : null}

        <View wrap={false}>
          <Colunas
            esquerda={
              <View style={s.quadro}>
                <Text style={s.quadroTitulo}>Declaração do candidato</Text>
                <Text style={s.quadroTexto}>
                  Declaro, para fins de locação, que as informações deste dossiê são verdadeiras e autorizo o
                  proprietário ou a imobiliária a confirmá-las com as referências indicadas.
                </Text>
                <View style={s.assinatura}>
                  <Text style={s.assinaturaNome}>{r.nome}</Text>
                  <Text style={s.assinaturaInfo}>Aceite eletrônico em {dataHora(dados.aceiteEm)}</Text>
                </View>
              </View>
            }
            direita={
              <View style={s.quadro}>
                <Text style={s.quadroTitulo}>Autenticidade</Text>
                <Text style={s.quadroTexto}>
                  Confira se os dados deste documento conferem com o registro original:
                </Text>
                <Text style={s.codigo}>{dados.codigo}</Text>
                <Link src={dados.urlVerificacao} style={s.link}>
                  {dados.urlVerificacao.replace(/^https?:\/\//, "")}
                </Link>
              </View>
            }
          />
          <Text style={s.nota}>
            * Aluguel compatível: estimativa pela regra de mercado de comprometimento de até 30% da renda mensal
            com o aluguel. As informações foram declaradas pelo candidato; os comprovantes enviados seguem anexos
            ao final deste documento.
          </Text>
        </View>

        <Rodape />
      </Page>

      {dados.anexos.map((a, i) => (
        // Sem wrap={false} aqui: na <Page> ele encolhe a altura da página para o tamanho do conteúdo.
        <Page key={i} size="A4" style={s.pagina}>
          <Text style={s.cabecalhoContinuo}>
            {`${PRODUTO.documento.toUpperCase()}  ·  ${r.nome.toUpperCase()}  ·  ${dados.codigo}`}
          </Text>
          <View style={s.anexoCabecalho}>
            <View>
              <Text style={s.anexoRotulo}>ANEXO {a.numero} · COMPROVANTE DE RENDA</Text>
              <Text style={s.anexoNome}>{a.nome}</Text>
            </View>
            {a.parte ? <Text style={s.anexoParte}>{a.parte}</Text> : null}
          </View>
          <View style={s.anexoCaixa}>
            {a.imagem ? (
              // eslint-disable-next-line jsx-a11y/alt-text -- Image do react-pdf não tem alt
              <Image src={a.imagem} style={s.anexoImagem} />
            ) : a.aviso ? (
              <Text style={s.anexoAviso}>{a.aviso}</Text>
            ) : null}
          </View>
          <Rodape />
        </Page>
      ))}
    </Document>
  );
}
