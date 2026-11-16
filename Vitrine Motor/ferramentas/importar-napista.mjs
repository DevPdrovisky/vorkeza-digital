#!/usr/bin/env node
// Cria a PRÉVIA de uma revenda a partir da página pública dela no Napista.
// Uso: node importar-napista.mjs <url-da-loja-no-napista> <slug> [whatsapp 55DDDNUMERO] [#cor]
// Ex.: node importar-napista.mjs https://napista.com.br/busca/carro/vendedor-br_kar_multimarcas_1008026 br-kar-multimarcas 55DDDNUMERO #C81E1E
// Usa só dados públicos do anúncio. Fotos ficam como link (nada é baixado). Campos que o anúncio não informa
// ficam "A confirmar" ou vazios: nunca invente dado de veículo.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MARCA = JSON.parse(fs.readFileSync(path.join(RAIZ, 'marca.json'), 'utf8'));
const [url, slug, whats, cor] = process.argv.slice(2);
if (!url || !/^[a-z0-9-]+$/.test(slug || '')) { console.error('uso: node importar-napista.mjs <url> <slug> [whatsapp] [#cor]'); process.exit(1); }

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const html = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
if (!m) { console.error('Não achei os dados na página. O Napista pode ter mudado o formato.'); process.exit(1); }
const res = JSON.parse(m[1]).props.pageProps.searchResult;
const ofertas = res.offers || [];
if (!ofertas.length) { console.error('Nenhum veículo na página.'); process.exit(1); }

const titulo = s => String(s || '').toLowerCase().replace(/(^|[\s/-])([a-zà-ú])/g, (a, b, c) => b + c.toUpperCase()).replace(/\b(Cd|Cs|Xl|Xls|Xlt|Lt|Ltz|Ls|Gl|Glx|Gls|Elx|Hlx|Ex|Exl|Lx|Tsi|Mpi|Gt|Gti|Rs|Se|Le|Xei|Xli|Gli|Srv|Sr|Dct|Cvt|At|Mt|Ii|Iii|Vvt|Vti|Abs|Es)\b/g, x => x.toUpperCase());
const cat = (marca, modelo, versao) => {
  const t = `${marca} ${modelo} ${versao}`.toLowerCase();
  if (/\b(biz|nxr|bros|cg|fan|titan|pop|factor|fazer|xre|pcx|lead|nmax|crosser|tenere|cb|xj6|mt-0|yes|intruder|burgman)\b/.test(t)) return 'Moto';
  if (/\b(strada|saveiro|montana|toro|ranger|hilux|s10|amarok|frontier|l200|oroch|courier|maverick|rampage)\b/.test(t)) return 'Picape';
  if (/\b(ecosport|tiggo|duster|creta|compass|renegade|kicks|t-cross|nivus|tracker|hr-v|hrv|tucson|sportage|captur|pajero|sw4|trailblazer|2008|3008|c4 cactus|aircross|tiguan|taos|corolla cross|rav4|outlander)\b/.test(t)) return 'SUV';
  if (/\b(vectra|voyage|cobalt|classic|corolla|civic|prisma|logan|siena|grand siena|versa|virtus|jetta|honda city|cronos|onix plus|hb20s|sentra|focus sedan|fiesta sedan|astra sedan|linea|fluence|cruze sedan)\b/.test(t)) return 'Sedã';
  if (/\b(xsara picasso|spin|zafira|meriva|livina|idea|doblo|picasso)\b/.test(t)) return 'Minivan';
  return 'Hatch';
};
const cambio = (versao, categoria) => /\b(aut|auto|automático|automatico|dct|cvt|at|tiptronic|dualogic|i-motion|easytronic)\b/i.test(versao) ? 'Automático' : (categoria === 'Moto' ? 'A confirmar' : 'A confirmar');
const comb = v => /flex|econoflex|flexpower|total flex/i.test(v) ? 'Flex' : /diesel|\b2\.2 cd|\b3\.2|tdi|d-4d|multijet/i.test(v) ? 'Diesel' : 'A confirmar';

const veiculos = ofertas.map((o, i) => {
  const marca = titulo(o.makeName);
  const modelo = titulo(o.compMakeModelName || '').replace(new RegExp('^' + marca + '\\s*', 'i'), '') || titulo(o.modelName);
  const versaoBruta = o.compVersionName || o.versionName || '';
  const versao = titulo(versaoBruta);
  const categoria = cat(marca, modelo, versaoBruta);
  const km = Number(o.mileage);
  return {
    id: String(i + 1), marca, modelo, versao,
    anoFab: o.manufacturedYear, anoMod: o.modelYear,
    km: km >= 1000 || o.modelYear >= new Date().getFullYear() - 1 ? km : null,
    preco: Number(o.price), precoAntigo: null, categoria,
    cambio: cambio(o.versionName, categoria), combustivel: comb(o.versionName),
    selos: [], destaque: false, status: 'disponivel', entrada: String(o.createdDate || '').slice(0, 10),
    opcionais: (o.equipments || []).map(e => typeof e === 'string' ? e : e.name).filter(Boolean).slice(0, 16),
    descricao: 'Dados do anúncio público da loja. Confirme quilometragem, câmbio e detalhes pelo WhatsApp.',
    fotos: (o.photos || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).slice(0, 12).map(f => ({ url: f.url })),
  };
}).filter(v => v.fotos.length && v.preco > 1000);

const loc = ofertas[0].location || {};
const nome = ofertas[0].seller || res.seller?.name || slug;
const dir = path.join(RAIZ, '3-Produto', 'clientes', slug);
fs.mkdirSync(dir, { recursive: true });
const loja = {
  nome, nomeCurto: nome.split(/\s+/)[0], slogan: '',
  cidade: loc.city || '', uf: loc.uf || 'SP',
  endereco: [loc.street && `${loc.street}${loc.number ? ', ' + loc.number : ''}`, loc.neighborhood].filter(Boolean).join(' - '),
  whatsapp: whats || '55DDDNUMERO', telefone: '', instagram: '',
  horarios: [], cnpj: '', cores: { primaria: cor || '#C81E1E', escura: '#111317' }, logo: '',
  url: `${MARCA.url}previa/${slug}/`, aceitaTroca: true, financiamento: true, compramos: true, modo: 'previa', indexar: false,
  fonte: url, importadoEm: new Date().toISOString().slice(0, 10),
};
fs.writeFileSync(path.join(dir, 'loja.json'), JSON.stringify(loja, null, 2) + '\n');
fs.writeFileSync(path.join(dir, 'estoque.json'), JSON.stringify({ veiculos }, null, 2) + '\n');
console.log(`Prévia criada em clientes/${slug}: ${veiculos.length} veículos de "${nome}".`);
if (!whats) console.log('ATENÇÃO: falta o WhatsApp da loja em loja.json.');
console.log('Revise loja.json (cor, slogan, horário) e rode: node ferramentas/montar.mjs');
