#!/usr/bin/env node
// Vitrine Imóvel — gera o site de uma imobiliária ou corretor a partir de clientes/<slug>/loja.json + imoveis.json.
//
//   node gerar.mjs <slug>          gera saida/<slug>/
//   node gerar.mjs todos           gera todos os clientes
//   node gerar.mjs novo <slug>     cria a pasta de um cliente novo para preencher
//
// Campos que o anúncio não informa ficam null no imoveis.json e aparecem como "A confirmar". Nunca invente dado de imóvel.
// Fotos locais: clientes/<slug>/fotos/ + { "arquivo": "nome.jpg" }. Remotas (demo): { "url", "autor", "licenca", "fonte" }.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { creditoHtml, marca as marcaGrupo } from '../../grupo/grupo-node.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MODELO = path.join(ROOT, 'modelo');
const CLIENTES = path.join(ROOT, 'clientes');
const SAIDA = path.join(ROOT, 'saida');
const MARCA = JSON.parse(fs.readFileSync(path.join(ROOT, '..', 'marca.json'), 'utf8'));
MARCA.url = marcaGrupo('vitrineimovel').url; // a URL oficial vem de grupo/grupo.json
const HOJE = new Date();
const TIPOS = ['Casa', 'Apartamento', 'Terreno', 'Comercial'];
const STATUS = ['disponivel', 'reservado', 'vendido', 'alugado'];

// ---------- utilidades ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const brl = n => 'R$ ' + Math.round(n).toLocaleString('pt-BR');
const milhar = n => Math.round(n).toLocaleString('pt-BR');
const slugify = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const fone = n => { const d = String(n).replace(/\D/g, '').replace(/^55/, ''); return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : d; };
const wa = (num, msg) => `https://wa.me/${String(num).replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
const jsonSeguro = o => JSON.stringify(o).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
const falha = msg => { console.error('ERRO: ' + msg); process.exit(1); };
const tem = v => v !== null && v !== undefined && v !== '';
const AC = 'A confirmar';
const precoTxt = im => brl(im.preco) + (im.finalidade === 'aluguel' ? '/mês' : '');
const statusTxt = s => ({ vendido: 'Vendido', alugado: 'Alugado', reservado: 'Reservado' }[s] || '');
const fechado = im => im.status === 'vendido' || im.status === 'alugado';

function luminancia(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const sv = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="${d}"/></svg>`;
const ICONE = {
  seta: sv('M5 12h14M13 6l6 6-6 6'), voltar: sv('M19 12H5M11 18l-6-6 6-6'),
  busca: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  share: sv('M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13'),
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  relogio: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  check: sv('m5 12.5 4.5 4.5L19 7.5'), filtro: sv('M4 6h16M7 12h10M10 18h4'),
  insta: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>',
  cama: sv('M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 15h18M6 9V6.5A1.5 1.5 0 0 1 7.5 5h9A1.5 1.5 0 0 1 18 6.5V9'),
  banho: sv('M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM6 12V6a2 2 0 0 1 3.5-1.3M7 19l-1 2M17 19l1 2'),
  carro: sv('M5 16V13l1.6-3.7A2 2 0 0 1 8.4 8h7.2a2 2 0 0 1 1.8 1.3L19 13v3zM5 13h14M7.5 16v2M16.5 16v2'),
  regua: sv('M3 17 17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2'),
};
// ícone do WhatsApp (o mesmo da Vitrine Motor)
ICONE.wa = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.03c-.25.69-1.44 1.32-1.98 1.37-.51.05-.99.24-3.33-.69-2.82-1.11-4.6-4-4.74-4.18-.14-.19-1.13-1.5-1.13-2.87s.72-2.04.97-2.32c.26-.28.56-.35.75-.35l.54.01c.17.01.4-.07.63.48.24.57.81 1.97.88 2.11.07.14.12.31.02.5-.09.19-.14.31-.28.47l-.42.49c-.14.14-.29.29-.12.57.16.28.73 1.2 1.57 1.95 1.08.96 1.99 1.26 2.27 1.4.28.14.45.12.61-.07.17-.19.71-.83.9-1.11.19-.28.38-.24.63-.14.26.09 1.64.77 1.92.91.28.14.47.21.54.33.07.11.07.66-.18 1.35Z"/></svg>';

// ---------- carregar e validar ----------
function carregar(slug) {
  const dir = path.join(CLIENTES, slug);
  if (!fs.existsSync(dir)) falha(`cliente "${slug}" não existe em clientes/`);
  const loja = JSON.parse(fs.readFileSync(path.join(dir, 'loja.json'), 'utf8'));
  const { imoveis } = JSON.parse(fs.readFileSync(path.join(dir, 'imoveis.json'), 'utf8'));
  for (const k of ['nome', 'cidade', 'uf', 'whatsapp', 'cores']) if (!loja[k]) falha(`loja.json sem "${k}"`);
  if (loja.modo === 'demo') loja.url = MARCA.url + 'demo/';
  if (loja.modo === 'previa') loja.url = MARCA.url + `previa/${slug}/`;
  if (!/^55\d{10,11}$/.test(String(loja.whatsapp))) falha('whatsapp deve ter só números: 55 + DDD + número');
  if (!/^#[0-9a-fA-F]{6}$/.test(loja.cores.primaria || '')) falha('cores.primaria deve ser #RRGGBB');
  if (!Array.isArray(imoveis) || !imoveis.length) falha('imoveis.json sem imóveis');
  const ids = new Set();
  for (const im of imoveis) {
    const nome = `${im.titulo || im.tipo} (id ${im.id})`;
    for (const k of ['id', 'finalidade', 'tipo', 'bairro', 'preco']) if (!tem(im[k])) falha(`${nome}: falta "${k}"`);
    if (!['venda', 'aluguel'].includes(im.finalidade)) falha(`${nome}: finalidade deve ser venda ou aluguel`);
    if (!TIPOS.includes(im.tipo)) falha(`${nome}: tipo deve ser ${TIPOS.join(', ')}`);
    if (ids.has(im.id)) falha(`id repetido: ${im.id}`); ids.add(im.id);
    if (!(im.preco > 100)) falha(`${nome}: preço inválido`);
    if (!Array.isArray(im.fotos) || !im.fotos.length) falha(`${nome}: sem fotos`);
    for (const f of im.fotos) {
      if (f.arquivo && !fs.existsSync(path.join(dir, 'fotos', f.arquivo))) falha(`${nome}: foto ${f.arquivo} não está em fotos/`);
      if (!f.arquivo && !/^https:\/\//.test(f.url || '')) falha(`${nome}: foto sem "arquivo" nem "url" https`);
    }
    im.status = im.status || 'disponivel';
    if (!STATUS.includes(im.status)) falha(`${nome}: status deve ser ${STATUS.join(', ')}`);
    if (im.status === 'alugado' && im.finalidade !== 'aluguel') falha(`${nome}: "alugado" só vale para aluguel`);
    if (im.status === 'vendido' && im.finalidade !== 'venda') falha(`${nome}: "vendido" só vale para venda`);
    im.cidade = im.cidade || loja.cidade; im.uf = im.uf || loja.uf;
    im.titulo = im.titulo || `${im.tipo} em ${im.bairro}`;
    im.slug = slugify(`${im.tipo} ${im.finalidade} ${im.bairro} ${im.id}`);
    im.novo = im.entrada && (HOJE - new Date(im.entrada)) / 864e5 <= 7 && im.status === 'disponivel';
  }
  return { dir, loja, imoveis };
}

// ---------- fotos ----------
let sharp = null;
async function carregarSharp() {
  try { sharp = (await import('sharp')).default; return; } catch {}
  for (const p of [path.join(ROOT, 'node_modules'), 'C:/Users/cmraj/Desktop/PrixPablo/site/node_modules']) {
    try { sharp = createRequire(path.join(p, 'x.js'))('sharp'); return; } catch {}
  }
}
async function prepararFotos(dir, out, imoveis) {
  const destino = path.join(out, 'assets', 'fotos');
  for (const im of imoveis) {
    im.fotos = await Promise.all(im.fotos.map(async (f, i) => {
      if (!f.arquivo) {
        const grande = f.url;
        const pequena = /\/1280px-/.test(grande) ? grande.replace('/1280px-', '/500px-') : grande;
        return { grande, pequena, autor: f.autor || '', licenca: f.licenca || '', fonte: f.fonte || '', remota: true, cors: /wikimedia\.org/.test(grande) };
      }
      fs.mkdirSync(destino, { recursive: true });
      const base = `${im.slug}-${i + 1}`;
      const origem = path.join(dir, 'fotos', f.arquivo);
      if (sharp) {
        await sharp(origem).rotate().resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(destino, base + '.webp'));
        await sharp(origem).rotate().resize({ width: 640, withoutEnlargement: true }).webp({ quality: 72 }).toFile(path.join(destino, base + '-p.webp'));
        return { grande: `assets/fotos/${base}.webp`, pequena: `assets/fotos/${base}-p.webp`, local: true, cors: true };
      }
      const ext = path.extname(f.arquivo).toLowerCase();
      fs.copyFileSync(origem, path.join(destino, base + ext));
      return { grande: `assets/fotos/${base}${ext}`, pequena: `assets/fotos/${base}${ext}`, local: true, cors: true };
    }));
  }
}

// ---------- pedaços de HTML ----------
function head({ loja, titulo, descricao, prefixo, canonical, imagem, extra = '' }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descricao)}">
${!loja.indexar ? '<meta name="robots" content="noindex, nofollow">' : ''}
<meta name="theme-color" content="${esc(loja.cores.escura || '#0C1A15')}">
${canonical ? `<link rel="canonical" href="${esc(canonical)}">\n<meta property="og:url" content="${esc(canonical)}">` : ''}
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="${esc(loja.nome)}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descricao)}">
${imagem ? `<meta property="og:image" content="${esc(imagem)}">\n<meta name="twitter:card" content="summary_large_image">` : ''}
<link rel="preload" href="${prefixo}assets/fontes/manrope.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${prefixo}assets/estilo.css">
<link rel="stylesheet" href="${prefixo}assets/tema.css">
<link rel="icon" href="${prefixo}assets/icone.svg" type="image/svg+xml">
${extra}
</head>`;
}
const prefixoMsg = loja => loja.modo === 'demo' ? '[Teste na demonstração da Vitrine Imóvel] ' : '';
function faixaModo(loja) {
  if (loja.modo === 'demo') return `<div class="faixa-modo">Imobiliária fictícia para demonstração. <a href="${esc(MARCA.url)}">Quer um site assim com os seus imóveis? Conheça a ${esc(MARCA.nome)}</a></div>`;
  if (loja.modo === 'previa') return `<div class="faixa-modo">Prévia feita pela ${esc(MARCA.nome)} para ${esc(loja.nome)}. Ainda não é o site oficial. <a href="${esc(wa(MARCA.whatsapp, `Olá! Vi a prévia do site de ${loja.nome} e quero conversar.`))}">Falar sobre a prévia</a></div>`;
  return '';
}
function logo(loja, prefixo) {
  if (loja.logo) return `<img class="logo-img" src="${prefixo}assets/${esc(path.basename(loja.logo))}" alt="${esc(loja.nome)}">`;
  const ini = (loja.nomeCurto || loja.nome).split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();
  return `<span class="logo-mono" aria-hidden="true">${esc(ini)}</span><span class="logo-txt">${esc(loja.nome)}</span>`;
}
function topo(loja, prefixo) {
  const p = prefixo || './';
  return `${faixaModo(loja)}
<header class="topo">
  <div class="wrap topo-in">
    <a class="logo" href="${p}" aria-label="${esc(loja.nome)} — início">${logo(loja, prefixo)}</a>
    <nav class="topo-nav" aria-label="Principal">
      <a href="${p}?finalidade=venda#imoveis">Comprar</a>
      <a href="${p}?finalidade=aluguel#imoveis">Alugar</a>
      ${loja.anunciar ? `<a href="${p}#anunciar">Anunciar imóvel</a>` : ''}
      <a href="${p}#contato">Contato</a>
    </nav>
    <a class="btn btn-wa btn-sm" href="${esc(wa(loja.whatsapp, prefixoMsg(loja) + `Olá! Vim pelo site de ${loja.nome} e quero mais informações.`))}" target="_blank" rel="noopener">${ICONE.wa}<span>WhatsApp</span></a>
  </div>
</header>`;
}
function rodape(loja, prefixo) {
  const creci = [loja.creci && `CRECI ${esc(loja.creci)}`, loja.corretor && `Corretor responsável: ${esc(loja.corretor)}`].filter(Boolean).join(' · ');
  return `<footer class="rodape">
  <div class="wrap rodape-in">
    <div>
      <a class="logo logo-rodape" href="${prefixo || './'}">${logo(loja, prefixo)}</a>
      <p>${esc(loja.cidade)} — ${esc(loja.uf)}${loja.cnpj ? ` · CNPJ ${esc(loja.cnpj)}` : ''}${creci ? ` · ${creci}` : ''}</p>
      <p class="rodape-aviso">Fotos, valores e disponibilidade podem mudar sem aviso. Medidas e valores de condomínio e IPTU informados pelo proprietário; confirme antes de visitar.</p>
    </div>
    <p class="rodape-vm">${creditoHtml('vitrineimovel')}</p>
  </div>
</footer>`;
}
function msgInteresse(loja, im, url) {
  return prefixoMsg(loja) + `Olá! Vi ${im.titulo.toLowerCase().startsWith('casa') || im.titulo.toLowerCase().startsWith('área') ? 'a' : 'o'} "${im.titulo}" (${im.tipo.toLowerCase()} para ${im.finalidade === 'venda' ? 'venda' : 'alugar'}, ${im.bairro}) por ${precoTxt(im)} no site de ${loja.nome} e tenho interesse. Ainda está disponível?\n\nRef. #${im.id}${url ? `\n${url}` : ''}`;
}
function imgTag(f, alt, { classe = '', grande = false, prefixo = '', eager = false } = {}) {
  const src = f.remota ? (grande ? f.grande : f.pequena) : prefixo + (grande ? f.grande : f.pequena);
  const srcset = f.remota && f.pequena !== f.grande ? ` srcset="${esc(f.pequena)} 500w, ${esc(f.grande)} 1280w"` : (!f.remota && f.pequena !== f.grande ? ` srcset="${esc(prefixo + f.pequena)} 640w, ${esc(prefixo + f.grande)} 1280w"` : '');
  const sizes = grande ? '(min-width: 980px) 60vw, 100vw' : '(min-width: 1100px) 340px, (min-width: 700px) 45vw, 100vw';
  return `<img class="${classe}" src="${esc(src)}"${srcset} sizes="${sizes}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${f.remota && f.cors ? ' crossorigin="anonymous"' : ''}>`;
}
function selosHtml(im) {
  const s = [];
  if (im.novo) s.push('<span class="selo selo-novo">Novidade</span>');
  if (im.precoAntigo && im.precoAntigo > im.preco && im.status === 'disponivel') s.push('<span class="selo selo-baixou">Baixou o preço</span>');
  return s.join('');
}
function specsCard(im) {
  const li = [];
  if (im.tipo !== 'Terreno' && im.tipo !== 'Comercial') {
    if (tem(im.quartos)) li.push(`<li title="Quartos">${ICONE.cama}<span>${im.quartos} ${im.quartos === 1 ? 'quarto' : 'quartos'}</span></li>`);
    if (tem(im.suites) && im.suites > 0) li.push(`<li title="Suítes">${ICONE.banho}<span>${im.suites} ${im.suites === 1 ? 'suíte' : 'suítes'}</span></li>`);
  }
  if (tem(im.vagas) && im.tipo !== 'Terreno') li.push(`<li title="Vagas">${ICONE.carro}<span>${im.vagas === 0 ? 'Sem vaga' : `${im.vagas} ${im.vagas === 1 ? 'vaga' : 'vagas'}`}</span></li>`);
  if (tem(im.area)) li.push(`<li title="Área">${ICONE.regua}<span>${milhar(im.area)} m²</span></li>`);
  return li.join('');
}
function custos(im) {
  const c = [];
  if (tem(im.condominio) && im.condominio > 0) c.push(`Cond. ${brl(im.condominio)}`);
  if (tem(im.iptu) && im.iptu > 0) c.push(`IPTU ${brl(im.iptu)}${im.finalidade === 'aluguel' ? '' : '/ano'}`);
  return c.join(' · ');
}
function card(loja, im, prefixo, urlBase) {
  const href = `${prefixo}imovel/${im.slug}/`;
  const url = urlBase ? urlBase + `imovel/${im.slug}/` : '';
  const tarja = im.status !== 'disponivel' ? `<span class="tarja tarja-${im.status}">${statusTxt(im.status)}</span>` : '';
  const busca = slugify(`${im.titulo} ${im.tipo} ${im.bairro} ${im.cidade} ${im.finalidade === 'venda' ? 'venda comprar' : 'aluguel alugar'} ${(im.caracteristicas || []).join(' ')}`).replace(/-/g, ' ');
  return `<article class="card${fechado(im) ? ' card-vendido' : ''}" data-id="${esc(im.id)}" data-finalidade="${im.finalidade}" data-tipo="${esc(im.tipo)}" data-bairro="${esc(im.bairro)}" data-cidade="${esc(im.cidade)}" data-quartos="${im.quartos ?? 0}" data-suites="${im.suites ?? 0}" data-vagas="${im.vagas ?? 0}" data-area="${im.area ?? 0}" data-preco="${im.preco}" data-condominio="${im.condominio ?? ''}" data-iptu="${im.iptu ?? ''}" data-status="${im.status}" data-entrada="${esc(im.entrada || '')}" data-busca="${esc(busca)}">
  <a class="card-link" href="${href}">
    <div class="card-foto">${imgTag(im.fotos[0], im.titulo, { prefixo })}<div class="selos"><span class="selo selo-fin selo-${im.finalidade}">${im.finalidade === 'venda' ? 'Venda' : 'Aluguel'}</span>${selosHtml(im)}</div>${tarja}${im.fotos.length > 1 ? `<span class="card-qtd">${im.fotos.length} fotos</span>` : ''}</div>
    <div class="card-corpo">
      <p class="card-local">${esc(im.tipo)} · ${esc(im.bairro)}</p>
      <h3 class="card-titulo">${esc(im.titulo)}</h3>
      <ul class="card-specs">${specsCard(im)}</ul>
      <p class="card-preco">${im.precoAntigo && im.precoAntigo > im.preco && !fechado(im) ? `<s>${brl(im.precoAntigo)}</s>` : ''}<strong>${fechado(im) ? statusTxt(im.status) : precoTxt(im)}</strong></p>
      ${!fechado(im) && custos(im) ? `<p class="card-custos">${custos(im)}</p>` : ''}
    </div>
  </a>
  ${fechado(im)
    ? `<a class="card-wa card-wa-alt" href="${esc(wa(loja.whatsapp, prefixoMsg(loja) + `Olá! Vi que "${im.titulo}" já foi ${im.status}. Vocês têm algum parecido em ${im.bairro}?`))}" target="_blank" rel="noopener">Quero um parecido</a>`
    : `<a class="card-wa" href="${esc(wa(loja.whatsapp, msgInteresse(loja, im, url)))}" target="_blank" rel="noopener">${ICONE.wa}<span>Tenho interesse</span></a>`}
</article>`;
}
function ordemPadrao(a, b) {
  const peso = s => ({ disponivel: 0, reservado: 1, vendido: 2, alugado: 2 }[s]);
  return peso(a.status) - peso(b.status) || (b.destaque === true) - (a.destaque === true) || String(b.entrada || '').localeCompare(String(a.entrada || ''));
}
const opcoes = (lista, rotulo = x => x) => lista.map(x => `<option value="${esc(x)}">${esc(rotulo(x))}</option>`).join('');
const unicos = (arr, k) => [...new Set(arr.map(x => x[k]).filter(tem))];

// ---------- páginas ----------
function paginaInicial(loja, imoveis) {
  const disp = imoveis.filter(i => !fechado(i));
  const ordenados = [...imoveis].sort(ordemPadrao);
  const tipos = TIPOS.filter(t => imoveis.some(i => i.tipo === t));
  const bairros = unicos(imoveis, 'bairro').sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const cidades = unicos(imoveis, 'cidade').sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const fxVenda = [200000, 300000, 400000, 500000, 700000, 1000000, 1500000, 2000000].filter(f => imoveis.some(i => i.finalidade === 'venda' && i.preco <= f));
  const fxAluguel = [1000, 1500, 2000, 3000, 4000, 6000, 10000].filter(f => imoveis.some(i => i.finalidade === 'aluguel' && i.preco <= f));
  const capa = ordenados.find(i => i.destaque) || ordenados[0];
  const nVenda = disp.filter(i => i.finalidade === 'venda').length, nAluguel = disp.filter(i => i.finalidade === 'aluguel').length;
  const titulo = `${loja.nome} — Imóveis em ${loja.cidade}`;
  const desc = `${disp.length} imóveis para comprar ou alugar com ${loja.nome}, em ${loja.cidade}/${loja.uf}. ${loja.slogan || ''}`.trim();
  const img = capa.fotos[0].remota ? capa.fotos[0].grande : (loja.url ? loja.url + capa.fotos[0].grande : '');
  const dados = { loja: { nome: loja.nome, whatsapp: loja.whatsapp, modo: loja.modo || 'oficial' } };
  const sel = (id, rot, html, extra = '') => `<label><span>${rot}</span><select id="${id}"${extra}>${html}</select></label>`;
  return `${head({ loja, titulo, descricao: desc, prefixo: '', canonical: loja.url, imagem: img })}
<body class="pg-inicio">
${topo(loja, '')}
<main>
  <section class="hero">
    <div class="hero-fundo" aria-hidden="true">${imgTag(capa.fotos[0], '', { grande: true, eager: true })}</div>
    <div class="wrap hero-in">
      <p class="hero-kicker">${ICONE.pin}<span>${esc(loja.cidade)} — ${esc(loja.uf)}</span></p>
      <h1>${esc(loja.titulo || 'Encontre o imóvel certo, sem perder tempo')}</h1>
      ${loja.slogan ? `<p class="hero-sub">${esc(loja.slogan)}</p>` : ''}
      <div class="hero-fin" role="group" aria-label="O que você procura">
        <a class="hero-fin-btn" href="?finalidade=venda#imoveis">Quero comprar <small>${nVenda} ${nVenda === 1 ? 'imóvel' : 'imóveis'}</small></a>
        <a class="hero-fin-btn" href="?finalidade=aluguel#imoveis">Quero alugar <small>${nAluguel} ${nAluguel === 1 ? 'imóvel' : 'imóveis'}</small></a>
      </div>
      <form class="busca" role="search" id="busca-form">
        <label class="sr" for="busca">Buscar imóveis</label>
        ${ICONE.busca}
        <input id="busca" type="search" placeholder="Bairro, tipo ou característica (ex.: piscina)" autocomplete="off" enterkeyhint="search">
        <button class="btn btn-cor" type="submit">Buscar</button>
      </form>
    </div>
  </section>

  <section class="estoque" id="imoveis">
    <div class="wrap">
      <div class="barra" id="barra">
        <div class="chips" role="group" aria-label="Finalidade">
          <button class="chip ativo" type="button" data-fin="">Todos</button>
          <button class="chip" type="button" data-fin="venda">Comprar</button>
          <button class="chip" type="button" data-fin="aluguel">Alugar</button>
        </div>
        <button class="btn btn-claro btn-sm filtros-toggle" type="button" aria-expanded="false" aria-controls="filtros">${ICONE.filtro}<span>Filtros</span><b class="filtros-n" id="filtros-n" hidden></b></button>
        <div class="filtros" id="filtros">
          ${sel('f-tipo', 'Tipo', `<option value="">Todos</option>${opcoes(tipos)}`)}
          ${cidades.length > 1 ? sel('f-cidade', 'Cidade', `<option value="">Todas</option>${opcoes(cidades)}`) : ''}
          ${sel('f-bairro', 'Bairro', `<option value="">Todos</option>${opcoes(bairros)}`)}
          ${sel('f-preco', 'Preço até', `<option value="">Qualquer</option>${fxVenda.length ? `<optgroup label="Comprar">${fxVenda.map(f => `<option value="venda:${f}">${brl(f)}</option>`).join('')}</optgroup>` : ''}${fxAluguel.length ? `<optgroup label="Alugar (por mês)">${fxAluguel.map(f => `<option value="aluguel:${f}">${brl(f)}/mês</option>`).join('')}</optgroup>` : ''}`)}
          ${sel('f-quartos', 'Quartos', `<option value="">Qualquer</option>${[1, 2, 3, 4].map(n => `<option value="${n}">${n}+</option>`).join('')}`)}
          ${sel('f-suites', 'Suítes', `<option value="">Qualquer</option>${[1, 2, 3].map(n => `<option value="${n}">${n}+</option>`).join('')}`)}
          ${sel('f-vagas', 'Vagas', `<option value="">Qualquer</option>${[1, 2, 3].map(n => `<option value="${n}">${n}+</option>`).join('')}`)}
          ${sel('f-area', 'Área mínima', `<option value="">Qualquer</option>${[50, 80, 120, 200, 500, 1000].map(n => `<option value="${n}">${milhar(n)} m²</option>`).join('')}`)}
          ${sel('f-condominio', 'Condomínio até', `<option value="">Qualquer</option><option value="0">Sem condomínio</option>${[300, 500, 800, 1200].map(n => `<option value="${n}">${brl(n)}</option>`).join('')}`)}
          ${sel('f-iptu', 'IPTU até', `<option value="">Qualquer</option><option value="100">${brl(100)}/mês</option><option value="1000">${brl(1000)}/ano</option><option value="2000">${brl(2000)}/ano</option>`)}
          ${sel('f-ordem', 'Ordenar', '<option value="">Destaques</option><option value="preco-asc">Menor preço</option><option value="preco-desc">Maior preço</option><option value="area-desc">Maior área</option><option value="entrada-desc">Mais recentes</option>')}
          <button class="btn btn-claro btn-sm filtros-limpar" type="button" id="limpar">Limpar filtros</button>
        </div>
      </div>
      <p class="contagem" id="contagem" aria-live="polite">${imoveis.length} imóveis</p>
      <div class="grade" id="grade">
        ${ordenados.map(i => card(loja, i, '', loja.url)).join('\n')}
      </div>
      <div class="vazio" id="vazio" hidden>
        <p><strong>Nenhum imóvel com esses filtros.</strong></p>
        <p>Conte o que você procura que a gente avisa quando aparecer.</p>
        <a class="btn btn-wa" id="vazio-wa" href="${esc(wa(loja.whatsapp, prefixoMsg(loja) + `Olá! Estou procurando um imóvel e não achei no site de ${loja.nome}. Procuro: `))}" target="_blank" rel="noopener">${ICONE.wa}<span>Pedir pelo WhatsApp</span></a>
      </div>
    </div>
  </section>

  ${loja.anunciar ? `<section class="vender" id="anunciar">
    <div class="wrap vender-in">
      <div>
        <h2>Quer vender ou alugar o seu imóvel?</h2>
        <p>Conte o tipo, o bairro e o que você pretende. ${esc(loja.nome)} responde pelo WhatsApp e combina a avaliação.</p>
      </div>
      <form class="form-wa" data-tipo="anunciar">
        <label><span>Quero</span><select name="finalidade"><option>Vender</option><option>Alugar</option></select></label>
        <label><span>Tipo</span><select name="tipo">${opcoes(TIPOS)}</select></label>
        <label><span>Bairro</span><input name="bairro" required placeholder="Ex.: Centro" maxlength="50" autocomplete="off"></label>
        <button class="btn btn-wa" type="submit">${ICONE.wa}<span>Pedir avaliação</span></button>
      </form>
    </div>
  </section>` : ''}

  <section class="loja" id="contato">
    <div class="wrap loja-in">
      <div>
        <h2>Fale com ${esc(loja.nome)}</h2>
        <p class="loja-linha">${ICONE.pin}<span>${esc(loja.endereco || `${loja.cidade} — ${loja.uf}`)}</span></p>
        ${(loja.horarios || []).length ? `<div class="loja-linha">${ICONE.relogio}<span>${loja.horarios.map(esc).join('<br>')}</span></div>` : ''}
      </div>
      <div class="loja-acoes">
        <a class="btn btn-wa" href="${esc(wa(loja.whatsapp, prefixoMsg(loja) + `Olá! Quero falar com ${loja.nome}.`))}" target="_blank" rel="noopener">${ICONE.wa}<span>${fone(loja.whatsapp)}</span></a>
        ${loja.endereco && loja.modo !== 'demo' ? `<a class="btn btn-claro" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loja.nome}, ${loja.endereco}, ${loja.cidade} ${loja.uf}`)}" target="_blank" rel="noopener">${ICONE.pin}<span>Como chegar</span></a>` : ''}
        ${loja.instagram ? `<a class="btn btn-claro" href="${esc(loja.instagram)}" target="_blank" rel="noopener">${ICONE.insta}<span>Instagram</span></a>` : ''}
      </div>
    </div>
  </section>
</main>
${rodape(loja, '')}
<a class="wa-flutuante" href="${esc(wa(loja.whatsapp, prefixoMsg(loja) + `Olá! Vim pelo site de ${loja.nome}.`))}" target="_blank" rel="noopener" aria-label="Conversar no WhatsApp">${ICONE.wa}</a>
<script type="application/json" id="vi-dados">${jsonSeguro(dados)}</script>
<script src="assets/vitrine.js" defer></script>
</body>
</html>`;
}

function paginaImovel(loja, im, imoveis) {
  const p = '../../';
  const url = loja.url ? loja.url + `imovel/${im.slug}/` : '';
  const titulo = `${im.titulo} — ${fechado(im) ? statusTxt(im.status) : precoTxt(im)} | ${loja.nome}`;
  const resumo = [im.tipo, im.finalidade === 'venda' ? 'à venda' : 'para alugar', `em ${im.bairro}, ${im.cidade}`].join(' ');
  const desc = `${resumo}. ${[tem(im.quartos) && im.tipo !== 'Terreno' ? `${im.quartos} quartos` : '', tem(im.area) ? `${milhar(im.area)} m²` : ''].filter(Boolean).join(', ')}. ${fechado(im) ? statusTxt(im.status) + '.' : precoTxt(im) + '.'} ${loja.nome}.`;
  const img = im.fotos[0].remota ? im.fotos[0].grande : (loja.url ? loja.url + im.fotos[0].grande : '');
  const parecidos = imoveis.filter(o => o.id !== im.id && !fechado(o) && o.finalidade === im.finalidade)
    .map(o => ({ o, d: (o.tipo === im.tipo ? 0 : 1) + Math.abs(o.preco - im.preco) / im.preco })).sort((a, b) => a.d - b.d).slice(0, 3).map(x => x.o);
  const casa = !['Terreno', 'Comercial'].includes(im.tipo);
  const v = (x, f = y => y) => tem(x) ? f(x) : AC;
  const specs = [
    ['Finalidade', im.finalidade === 'venda' ? 'Venda' : 'Aluguel'], ['Tipo', im.tipo], ['Bairro', im.bairro], ['Cidade', `${im.cidade} — ${im.uf}`],
    casa && ['Quartos', v(im.quartos)], casa && ['Suítes', v(im.suites)], im.tipo !== 'Terreno' && ['Vagas', v(im.vagas, n => n === 0 ? 'Não tem' : n)],
    [im.tipo === 'Terreno' ? 'Área do terreno' : 'Área útil', v(im.area, n => `${milhar(n)} m²`)],
    tem(im.areaTerreno) && im.tipo !== 'Terreno' && ['Área do terreno', `${milhar(im.areaTerreno)} m²`],
    ['Condomínio', v(im.condominio, n => n === 0 ? 'Não tem' : `${brl(n)}/mês`)],
    ['IPTU', v(im.iptu, n => n === 0 ? 'Isento' : `${brl(n)}/${im.finalidade === 'aluguel' ? 'mês' : 'ano'}`)],
  ].filter(Boolean);
  const total = im.finalidade === 'aluguel' && tem(im.condominio) && tem(im.iptu) ? im.preco + im.condominio + im.iptu : null;
  const ld = {
    '@context': 'https://schema.org', '@type': im.tipo === 'Apartamento' ? 'Apartment' : im.tipo === 'Casa' ? 'SingleFamilyResidence' : 'Place',
    name: im.titulo, url: url || undefined, image: im.fotos.map(f => f.remota ? f.grande : (loja.url ? loja.url + f.grande : '')).filter(Boolean),
    address: { '@type': 'PostalAddress', addressLocality: im.cidade, addressRegion: im.uf, addressCountry: 'BR' },
    numberOfRooms: casa && tem(im.quartos) ? im.quartos : undefined,
    floorSize: tem(im.area) ? { '@type': 'QuantitativeValue', value: im.area, unitCode: 'MTK' } : undefined,
  };
  const dados = { loja: { nome: loja.nome, whatsapp: loja.whatsapp, modo: loja.modo || 'oficial' }, imovel: { id: im.id, nome: im.titulo, finalidade: im.finalidade, preco: im.preco, precoTxt: precoTxt(im), url, status: im.status, bairro: im.bairro } };
  const creditos = im.fotos.filter(f => f.autor);
  const msg = msgInteresse(loja, im, url);
  return `${head({ loja, titulo, descricao: desc, prefixo: p, canonical: url, imagem: img, extra: `<script type="application/ld+json">${jsonSeguro(ld)}</script>` })}
<body class="pg-carro pg-imovel">
${topo(loja, p)}
<main class="wrap carro">
  <a class="voltar" href="${p}?finalidade=${im.finalidade}#imoveis">${ICONE.voltar}<span>Voltar aos imóveis</span></a>
  <div class="carro-grid">
    <section class="galeria" aria-label="Fotos do imóvel">
      <div class="galeria-trilho" id="trilho" tabindex="0">
        ${im.fotos.map((f, i) => `<figure class="galeria-item">${imgTag(f, `${im.titulo} — foto ${i + 1}`, { grande: true, prefixo: p, eager: i === 0 })}</figure>`).join('')}
      </div>
      ${im.fotos.length > 1 ? `<button class="galeria-btn ant" type="button" aria-label="Foto anterior">${ICONE.voltar}</button><button class="galeria-btn prox" type="button" aria-label="Próxima foto">${ICONE.seta}</button><span class="galeria-cont" id="galeria-cont">1 / ${im.fotos.length}</span>` : ''}
      ${im.status !== 'disponivel' ? `<span class="tarja tarja-${im.status} tarja-grande">${statusTxt(im.status)}</span>` : ''}
      ${im.fotos.length > 1 ? `<div class="miniaturas">${im.fotos.map((f, i) => `<button type="button" class="mini${i === 0 ? ' ativa' : ''}" data-i="${i}" aria-label="Ver foto ${i + 1}">${imgTag(f, '', { prefixo: p })}</button>`).join('')}</div>` : ''}
    </section>

    <section class="info">
      <div class="selos selos-info"><span class="selo selo-fin selo-${im.finalidade}">${im.finalidade === 'venda' ? 'Venda' : 'Aluguel'}</span>${selosHtml(im)}</div>
      <h1 class="info-titulo">${esc(im.titulo)} <span>${esc(im.tipo)} em ${esc(im.bairro)}, ${esc(im.cidade)}</span></h1>
      <p class="info-preco">${im.precoAntigo && im.precoAntigo > im.preco && !fechado(im) ? `<s>${brl(im.precoAntigo)}</s>` : ''}<strong>${fechado(im) ? statusTxt(im.status) : precoTxt(im)}</strong></p>
      ${total && !fechado(im) ? `<p class="info-total">Aluguel + condomínio + IPTU: <b>${brl(total)}/mês</b></p>` : ''}
      ${im.status === 'reservado' ? '<p class="aviso-status">Este imóvel está reservado. Fale com a gente para entrar na fila ou ver opções parecidas.</p>' : ''}
      ${fechado(im) ? `<p class="aviso-status">Este imóvel já foi ${im.status}. Podemos ter outro parecido.</p>` : ''}
      <ul class="card-specs info-specs">${specsCard(im)}</ul>
      <dl class="specs">${specs.map(([k, val]) => `<div><dt>${esc(k)}</dt><dd${val === AC ? ' class="a-confirmar"' : ''}>${esc(val)}</dd></div>`).join('')}</dl>
      <div class="acoes">
        ${fechado(im)
          ? `<a class="btn btn-wa btn-grande" href="${esc(wa(loja.whatsapp, prefixoMsg(loja) + `Olá! Vi que "${im.titulo}" já foi ${im.status}. Vocês têm algum parecido?`))}" target="_blank" rel="noopener">${ICONE.wa}<span>Quero um parecido</span></a>`
          : `<a class="btn btn-wa btn-grande" href="${esc(wa(loja.whatsapp, msg))}" target="_blank" rel="noopener">${ICONE.wa}<span>Tenho interesse</span></a>`}
        <button class="btn btn-claro" type="button" id="compartilhar">${ICONE.share}<span>Compartilhar</span></button>
      </div>
      ${!fechado(im) ? `<div class="sanfona">
        <details>
          <summary>Agendar visita</summary>
          <form class="form-wa" data-tipo="visita">
            <label><span>Dia</span><select name="dia"><option>Hoje</option><option>Amanhã</option><option>Nesta semana</option><option>No sábado</option></select></label>
            <label><span>Período</span><select name="periodo"><option>Manhã</option><option>Tarde</option></select></label>
            <button class="btn btn-wa largo" type="submit">${ICONE.wa}<span>Agendar pelo WhatsApp</span></button>
          </form>
        </details>
        ${im.finalidade === 'venda' ? `<details>
          <summary>Simular financiamento</summary>
          <form class="form-wa" data-tipo="financiamento">
            <label><span>Entrada (R$)</span><input name="entrada" inputmode="numeric" placeholder="Ex.: 100.000" maxlength="14"></label>
            <label><span>Prazo</span><select name="prazo"><option>120 meses</option><option>240 meses</option><option selected>360 meses</option><option>420 meses</option></select></label>
            <label class="largo"><span>Seu nome</span><input name="nome" autocomplete="given-name" maxlength="60"></label>
            <p class="form-nota largo">A imobiliária responde com as condições. Não envie documentos por aqui.</p>
            <button class="btn btn-wa largo" type="submit">${ICONE.wa}<span>Enviar</span></button>
          </form>
        </details>` : `<details>
          <summary>Quero alugar</summary>
          <form class="form-wa" data-tipo="alugar">
            <label><span>Garantia</span><select name="garantia"><option>Ainda não sei</option><option>Seguro fiança</option><option>Fiador</option><option>Caução</option></select></label>
            <label><span>Mudança</span><select name="mudanca"><option>O quanto antes</option><option>Em até 30 dias</option><option>Em 1 a 3 meses</option></select></label>
            <p class="form-nota largo">As condições de garantia são definidas pela imobiliária. Não envie documentos por aqui.</p>
            <button class="btn btn-wa largo" type="submit">${ICONE.wa}<span>Enviar</span></button>
          </form>
        </details>`}
      </div>` : ''}
      ${(im.caracteristicas || []).length ? `<h2 class="info-sub">Características</h2><ul class="opcionais">${im.caracteristicas.map(o => `<li>${ICONE.check}<span>${esc(o)}</span></li>`).join('')}</ul>` : ''}
      ${im.descricao ? `<h2 class="info-sub">Sobre este imóvel</h2><p class="descricao">${esc(im.descricao)}</p>` : ''}
      <p class="info-nota">Por segurança, o endereço exato é passado na hora de agendar a visita.</p>
    </section>
  </div>

  ${parecidos.length ? `<section class="parecidos"><h2>Você também pode gostar</h2><div class="grade grade-3">${parecidos.map(o => card(loja, o, p, loja.url)).join('')}</div></section>` : ''}
  ${creditos.length ? `<p class="creditos">Fotos: ${creditos.map(f => `${f.fonte ? `<a href="${esc(f.fonte)}" rel="noopener nofollow" target="_blank">${esc(f.autor)}</a>` : esc(f.autor)} (${esc(f.licenca)})`).join(' · ')}, via Wikimedia Commons. Imagens ilustrativas.</p>` : ''}
</main>
${!fechado(im) ? `<div class="barra-fixa"><div><small>${esc(im.tipo)} · ${esc(im.bairro)}</small><strong>${precoTxt(im)}</strong></div><a class="btn btn-wa" href="${esc(wa(loja.whatsapp, msg))}" target="_blank" rel="noopener">${ICONE.wa}<span>Tenho interesse</span></a></div>` : ''}
${rodape(loja, p)}
<div class="toast" id="toast" role="status" hidden></div>
<script type="application/json" id="vi-dados">${jsonSeguro(dados)}</script>
<script src="${p}assets/vitrine.js" defer></script>
</body>
</html>`;
}

function paginaArtes(loja, imoveis) {
  const p = '../';
  const lista = [...imoveis].sort(ordemPadrao);
  const dados = {
    loja: { nome: loja.nome, fone: fone(loja.whatsapp), cor: loja.cores.primaria, escura: loja.cores.escura || '#0C1A15', site: (loja.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '') },
    imoveis: lista.map(im => ({
      id: im.id, titulo: im.titulo, sub: `${im.tipo} · ${im.bairro}`, finalidade: im.finalidade,
      chips: [im.tipo !== 'Terreno' && im.tipo !== 'Comercial' && tem(im.quartos) ? `${im.quartos} ${im.quartos === 1 ? 'quarto' : 'quartos'}` : '', tem(im.vagas) && im.vagas > 0 ? `${im.vagas} ${im.vagas === 1 ? 'vaga' : 'vagas'}` : '', tem(im.area) ? `${milhar(im.area)} m²` : ''].filter(Boolean),
      preco: precoTxt(im), precoAntigo: im.precoAntigo && im.precoAntigo > im.preco ? brl(im.precoAntigo) : '', status: im.status,
      foto: im.fotos[0].remota ? im.fotos[0].grande : p + im.fotos[0].grande, cors: im.fotos[0].cors !== false,
      selo: im.novo ? 'Novidade' : (im.precoAntigo > im.preco ? 'Baixou o preço' : (im.finalidade === 'venda' ? 'À venda' : 'Para alugar')),
    })),
  };
  const fimTxt = im => im.finalidade === 'venda' ? 'Vendido' : 'Alugado';
  return `${head({ loja: { ...loja, indexar: false }, titulo: `Artes para status e stories — ${loja.nome}`, descricao: 'Gere as artes dos imóveis para o status do WhatsApp e o Instagram.', prefixo: p })}
<body class="pg-artes">
${topo(loja, p)}
<main class="wrap artes">
  <h1>Artes dos imóveis</h1>
  <p class="artes-sub">Toque em um formato para gerar a arte. No celular, ela abre direto para compartilhar no status do WhatsApp ou no Instagram. Imóvel negociado ganha a arte "VENDIDO" ou "ALUGADO".</p>
  ${imoveis.some(i => i.fotos[0].cors === false) ? '<p class="aviso-status">Nesta prévia algumas fotos vêm de outro site, que não permite gerar artes. No site oficial, com as fotos enviadas por você, as artes funcionam em todos os imóveis.</p>' : ''}
  <div class="artes-grade">
    ${lista.map(im => `<article class="arte-item${fechado(im) ? ' arte-vendido' : ''}">
      ${imgTag(im.fotos[0], im.titulo, { prefixo: p })}
      <div class="arte-corpo">
        <h2>${esc(im.titulo)} <small>${esc(im.tipo)} · ${esc(im.bairro)}</small></h2>
        <p>${fechado(im) ? statusTxt(im.status) : precoTxt(im)}</p>
        <div class="arte-botoes">
          ${fechado(im)
            ? `<button class="btn btn-cor btn-sm" type="button" data-arte="fim" data-id="${esc(im.id)}">Arte "${statusTxt(im.status)}"</button>`
            : `<button class="btn btn-cor btn-sm" type="button" data-arte="story" data-id="${esc(im.id)}">Status / Story</button><button class="btn btn-claro btn-sm" type="button" data-arte="feed" data-id="${esc(im.id)}">Feed</button><button class="btn btn-claro btn-sm" type="button" data-arte="fim" data-id="${esc(im.id)}">${fimTxt(im)}</button>`}
        </div>
      </div>
    </article>`).join('')}
  </div>
  <dialog class="arte-preview" id="arte-preview">
    <img id="arte-img" alt="Prévia da arte">
    <div class="arte-preview-acoes">
      <button class="btn btn-wa" type="button" id="arte-share">${ICONE.share}<span>Compartilhar</span></button>
      <a class="btn btn-claro" id="arte-baixar" download>Baixar</a>
      <button class="btn btn-claro" type="button" id="arte-fechar">Fechar</button>
    </div>
  </dialog>
</main>
<canvas id="arte-canvas" hidden></canvas>
<script type="application/json" id="vi-artes">${jsonSeguro(dados)}</script>
<script src="${p}assets/artes.js" defer></script>
</body>
</html>`;
}

function icone(loja) {
  const ini = (loja.nomeCurto || loja.nome).split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${loja.cores.primaria}"/><text x="32" y="42" font-family="Arial, sans-serif" font-size="26" font-weight="800" text-anchor="middle" fill="${luminancia(loja.cores.primaria) > 0.45 ? '#111' : '#fff'}">${esc(ini)}</text></svg>`;
}
function tema(loja) {
  const cor = loja.cores.primaria;
  return `:root{--cor:${cor};--cor-txt:${luminancia(cor) > 0.45 ? '#111317' : '#ffffff'};--escura:${loja.cores.escura || '#0C1A15'};}\n`;
}

// ---------- montar ----------
async function gerar(slug) {
  const { dir, loja, imoveis } = carregar(slug);
  if (loja.url && !loja.url.endsWith('/')) loja.url += '/';
  const out = path.join(SAIDA, slug);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, 'assets', 'fontes'), { recursive: true });
  await prepararFotos(dir, out, imoveis);
  for (const f of ['estilo.css', 'vitrine.js', 'artes.js']) fs.copyFileSync(path.join(MODELO, f), path.join(out, 'assets', f));
  for (const f of fs.readdirSync(path.join(MODELO, 'fontes'))) fs.copyFileSync(path.join(MODELO, 'fontes', f), path.join(out, 'assets', 'fontes', f));
  if (loja.logo) fs.copyFileSync(path.join(dir, loja.logo), path.join(out, 'assets', path.basename(loja.logo)));
  fs.writeFileSync(path.join(out, 'assets', 'tema.css'), tema(loja));
  fs.writeFileSync(path.join(out, 'assets', 'icone.svg'), icone(loja));
  fs.writeFileSync(path.join(out, 'index.html'), paginaInicial(loja, imoveis));
  for (const im of imoveis) {
    const d = path.join(out, 'imovel', im.slug);
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'index.html'), paginaImovel(loja, im, imoveis));
  }
  fs.mkdirSync(path.join(out, 'artes'), { recursive: true });
  fs.writeFileSync(path.join(out, 'artes', 'index.html'), paginaArtes(loja, imoveis));
  if (loja.indexar && loja.url) {
    fs.writeFileSync(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>${esc(loja.url)}</loc></url>\n${imoveis.filter(i => !fechado(i)).map(i => `<url><loc>${esc(loja.url)}imovel/${i.slug}/</loc></url>`).join('\n')}\n</urlset>\n`);
    fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nDisallow: /artes/\nSitemap: ${loja.url}sitemap.xml\n`);
  }
  const disp = imoveis.filter(i => i.status === 'disponivel').length;
  console.log(`OK ${slug}: ${imoveis.length} imóveis (${disp} disponíveis) -> saida/${slug}/`);
}

function novo(slug) {
  if (!/^[a-z0-9-]+$/.test(slug || '')) falha('use um nome só com letras minúsculas, números e hífen. Ex.: maria-corretora');
  const dir = path.join(CLIENTES, slug);
  if (fs.existsSync(dir)) falha(`clientes/${slug} já existe`);
  fs.mkdirSync(path.join(dir, 'fotos'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'loja.json'), JSON.stringify({
    nome: 'Nome da Imobiliária', nomeCurto: 'Nome', slogan: '', cidade: 'Cidade', uf: 'SP', endereco: '', whatsapp: '55DDDNUMERO', instagram: '',
    creci: '', corretor: '', horarios: ['Seg a sex: 8h30 às 18h', 'Sábado: 9h às 13h'], cnpj: '', cores: { primaria: '#0F9D6E', escura: '#0C1A15' }, logo: '',
    url: '', anunciar: true, modo: 'previa', indexar: false,
  }, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'imoveis.json'), JSON.stringify({ imoveis: [{
    id: '1', finalidade: 'venda', tipo: 'Casa', titulo: 'Casa de 3 quartos', bairro: 'Bairro', cidade: '', uf: '', quartos: null, suites: null, vagas: null,
    area: null, areaTerreno: null, condominio: null, iptu: null, preco: 0, precoAntigo: null, destaque: false, status: 'disponivel',
    entrada: new Date().toISOString().slice(0, 10), caracteristicas: [], descricao: '', fotos: [{ arquivo: 'imovel1-1.jpg' }],
  }] }, null, 2) + '\n');
  console.log(`Criado clientes/${slug}/. Preencha loja.json e imoveis.json (o que o anúncio não diz fica null = "A confirmar"), coloque as fotos em fotos/ e rode: node gerar.mjs ${slug}`);
}

const [cmd, arg] = process.argv.slice(2);
await carregarSharp();
if (!cmd) falha('uso: node gerar.mjs <slug> | todos | novo <slug>');
else if (cmd === 'novo') novo(arg);
else if (cmd === 'todos') { for (const s of fs.readdirSync(CLIENTES)) if (fs.existsSync(path.join(CLIENTES, s, 'loja.json'))) await gerar(s); }
else await gerar(cmd);
