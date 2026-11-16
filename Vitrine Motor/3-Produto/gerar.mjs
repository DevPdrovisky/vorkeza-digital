#!/usr/bin/env node
// Vitrine Motor — gera o site de estoque de uma revenda a partir de clientes/<slug>/loja.json + estoque.json.
//
//   node gerar.mjs <slug>          gera saida/<slug>/
//   node gerar.mjs todos           gera todos os clientes
//   node gerar.mjs novo <slug>     cria a pasta de um cliente novo para preencher
//
// Fotos locais: coloque em clientes/<slug>/fotos/ e use { "arquivo": "nome.jpg" } no estoque.
// Fotos remotas (prévias e demo): { "url": "https://...", "autor": "...", "licenca": "..." }.
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
MARCA.url = marcaGrupo('vitrinemotor').url; // a URL oficial vem de grupo/grupo.json
const HOJE = new Date();

// ---------- utilidades ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const brl = n => 'R$ ' + Math.round(n).toLocaleString('pt-BR');
const milhar = n => Math.round(n).toLocaleString('pt-BR');
const slugify = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const fone = n => { const d = String(n).replace(/\D/g, '').replace(/^55/, ''); return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : d; };
const wa = (num, msg) => `https://wa.me/${String(num).replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
const jsonSeguro = o => JSON.stringify(o).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
const falha = msg => { console.error('ERRO: ' + msg); process.exit(1); };

function luminancia(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const ICONE = {
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.03c-.25.69-1.44 1.32-1.98 1.37-.51.05-.99.24-3.33-.69-2.82-1.11-4.6-4-4.74-4.18-.14-.19-1.13-1.5-1.13-2.87s.72-2.04.97-2.32c.26-.28.56-.35.75-.35l.54.01c.17.01.4-.07.63.48.24.57.81 1.97.88 2.11.07.14.12.31.02.5-.09.19-.14.31-.28.47l-.42.49c-.14.14-.29.29-.12.57.16.28.73 1.2 1.57 1.95 1.08.96 1.99 1.26 2.27 1.4.28.14.45.12.61-.07.17-.19.71-.83.9-1.11.19-.28.38-.24.63-.14.26.09 1.64.77 1.92.91.28.14.47.21.54.33.07.11.07.66-.18 1.35Z"/></svg>',
  seta: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg>',
  voltar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M19 12H5M11 18l-6-6 6-6"/></svg>',
  busca: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  relogio: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  insta: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>',
  filtro: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 6h16M7 12h10M10 18h4"/></svg>',
};

// ---------- carregar e validar ----------
function carregar(slug) {
  const dir = path.join(CLIENTES, slug);
  if (!fs.existsSync(dir)) falha(`cliente "${slug}" não existe em clientes/`);
  const loja = JSON.parse(fs.readFileSync(path.join(dir, 'loja.json'), 'utf8'));
  const { veiculos } = JSON.parse(fs.readFileSync(path.join(dir, 'estoque.json'), 'utf8'));
  for (const k of ['nome', 'cidade', 'uf', 'whatsapp', 'cores']) if (!loja[k]) falha(`loja.json sem "${k}"`);
  if (loja.modo === 'demo') loja.url = MARCA.url + 'demo/';
  if (loja.modo === 'previa') loja.url = MARCA.url + `previa/${slug}/`;
  if (!/^55\d{10,11}$/.test(String(loja.whatsapp))) falha('whatsapp deve ter só números: 55 + DDD + número');
  if (!/^#[0-9a-fA-F]{6}$/.test(loja.cores.primaria || '')) falha('cores.primaria deve ser #RRGGBB');
  if (!Array.isArray(veiculos) || !veiculos.length) falha('estoque.json sem veículos');
  const ids = new Set();
  for (const v of veiculos) {
    const nome = `${v.marca} ${v.modelo} (id ${v.id})`;
    for (const k of ['id', 'marca', 'modelo', 'anoFab', 'anoMod', 'preco', 'categoria', 'cambio', 'combustivel']) if (v[k] === undefined || v[k] === '') falha(`${nome}: falta "${k}"`);
    if (ids.has(v.id)) falha(`id repetido: ${v.id}`); ids.add(v.id);
    if (!(v.preco > 1000)) falha(`${nome}: preço inválido`);
    if (!Array.isArray(v.fotos) || !v.fotos.length) falha(`${nome}: sem fotos`);
    for (const f of v.fotos) {
      if (f.arquivo && !fs.existsSync(path.join(dir, 'fotos', f.arquivo))) falha(`${nome}: foto ${f.arquivo} não está em fotos/`);
      if (!f.arquivo && !/^https:\/\//.test(f.url || '')) falha(`${nome}: foto sem "arquivo" nem "url" https`);
    }
    v.status = v.status || 'disponivel';
    if (!['disponivel', 'reservado', 'vendido'].includes(v.status)) falha(`${nome}: status deve ser disponivel, reservado ou vendido`);
    v.slug = slugify(`${v.marca} ${v.modelo} ${v.versao || ''} ${v.anoMod} ${v.id}`);
    v.titulo = `${v.marca} ${v.modelo}`;
    v.nomeCompleto = `${v.marca} ${v.modelo} ${v.versao || ''} ${v.anoFab}/${v.anoMod}`.replace(/\s+/g, ' ');
    v.novo = v.entrada && (HOJE - new Date(v.entrada)) / 864e5 <= 7 && v.status === 'disponivel';
  }
  return { dir, loja, veiculos };
}

// ---------- fotos ----------
let sharp = null;
async function carregarSharp() {
  try { sharp = (await import('sharp')).default; return; } catch {}
  for (const p of [path.join(ROOT, 'node_modules'), 'C:/Users/cmraj/Desktop/PrixPablo/site/node_modules']) {
    try { sharp = createRequire(path.join(p, 'x.js'))('sharp'); return; } catch {}
  }
}

async function prepararFotos(dir, out, veiculos) {
  const destino = path.join(out, 'assets', 'fotos');
  for (const v of veiculos) {
    v.fotos = await Promise.all(v.fotos.map(async (f, i) => {
      if (!f.arquivo) {
        const grande = f.url;
        const pequena = /\/1280px-/.test(grande) ? grande.replace('/1280px-', '/500px-') : grande;
        const fonte = f.fonte || (/wikimedia\.org/.test(grande) ? 'https://commons.wikimedia.org/wiki/File:' + grande.split('/1280px-').pop() : '');
        return { grande, pequena, autor: f.autor || '', licenca: f.licenca || '', fonte, remota: true, cors: /wikimedia.org/.test(grande) };
      }
      fs.mkdirSync(destino, { recursive: true });
      const base = `${v.slug}-${i + 1}`;
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
  const noindex = !loja.indexar ? '<meta name="robots" content="noindex, nofollow">' : '';
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descricao)}">
${noindex}
<meta name="theme-color" content="${esc(loja.cores.escura || '#111317')}">
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

function faixaModo(loja) {
  const vm = MARCA.url;
  if (loja.modo === 'demo') return `<div class="faixa-modo">Revenda fictícia para demonstração. <a href="${esc(vm)}">Quer um site assim com os seus carros? Conheça a ${esc(MARCA.nome)}</a></div>`;
  if (loja.modo === 'previa') return `<div class="faixa-modo">Prévia feita pela ${esc(MARCA.nome)} para a ${esc(loja.nome)}. Ainda não é o site oficial da loja. <a href="${esc(wa(MARCA.whatsapp, `Olá! Vi a prévia do site da ${loja.nome} e quero conversar.`))}">Falar sobre a prévia</a></div>`;
  return '';
}

function logo(loja, prefixo) {
  if (loja.logo) return `<img class="logo-img" src="${prefixo}assets/${esc(path.basename(loja.logo))}" alt="${esc(loja.nome)}">`;
  const iniciais = (loja.nomeCurto || loja.nome).split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();
  return `<span class="logo-mono" aria-hidden="true">${esc(iniciais)}</span><span class="logo-txt">${esc(loja.nome)}</span>`;
}

function topo(loja, prefixo) {
  const msg = prefixoMsg(loja) + `Olá! Vim pelo site da ${loja.nome} e quero mais informações.`;
  return `${faixaModo(loja)}
<header class="topo">
  <div class="wrap topo-in">
    <a class="logo" href="${prefixo || './'}" aria-label="${esc(loja.nome)} — início">${logo(loja, prefixo)}</a>
    <nav class="topo-nav" aria-label="Principal">
      <a href="${prefixo || './'}#estoque">Estoque</a>
      ${loja.compramos ? `<a href="${prefixo || './'}#vender">Venda seu carro</a>` : ''}
      <a href="${prefixo || './'}#loja">A loja</a>
    </nav>
    <a class="btn btn-wa btn-sm" href="${esc(wa(loja.whatsapp, msg))}" target="_blank" rel="noopener">${ICONE.wa}<span>WhatsApp</span></a>
  </div>
</header>`;
}

function rodape(loja, prefixo) {
  return `<footer class="rodape">
  <div class="wrap rodape-in">
    <div>
      <a class="logo logo-rodape" href="${prefixo || './'}">${logo(loja, prefixo)}</a>
      <p>${esc(loja.cidade)} — ${esc(loja.uf)}${loja.cnpj ? ` · CNPJ ${esc(loja.cnpj)}` : ''}</p>
      <p class="rodape-aviso">Fotos, preços e disponibilidade podem mudar sem aviso. Confirme com a loja pelo WhatsApp antes de visitar.</p>
    </div>
    <p class="rodape-vm">${creditoHtml('vitrinemotor')}</p>
  </div>
</footer>`;
}

function prefixoMsg(loja) { return loja.modo === 'demo' ? '[Teste na demonstração da Vitrine Motor] ' : ''; }

function msgInteresse(loja, v, urlCarro) {
  return prefixoMsg(loja) + `Olá! Vi o ${v.nomeCompleto} por ${brl(v.preco)} no site da ${loja.nome} e tenho interesse. Ainda está disponível?\n\nRef. #${v.id}${urlCarro ? `\n${urlCarro}` : ''}`;
}

function imgTag(f, alt, { classe = '', grande = false, prefixo = '', eager = false } = {}) {
  const src = f.remota ? (grande ? f.grande : f.pequena) : prefixo + (grande ? f.grande : f.pequena);
  const srcset = f.remota && f.pequena !== f.grande ? ` srcset="${esc(f.pequena)} 500w, ${esc(f.grande)} 1280w"` : (!f.remota && f.pequena !== f.grande ? ` srcset="${esc(prefixo + f.pequena)} 640w, ${esc(prefixo + f.grande)} 1280w"` : '');
  const sizes = grande ? '(min-width: 980px) 60vw, 100vw' : '(min-width: 1100px) 340px, (min-width: 700px) 45vw, 100vw';
  return `<img class="${classe}" src="${esc(src)}"${srcset} sizes="${sizes}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${f.remota && f.cors ? ' crossorigin="anonymous"' : ''}>`;
}

function selosHtml(v) {
  const s = [];
  if (v.novo) s.push('<span class="selo selo-novo">Novo no estoque</span>');
  if (v.precoAntigo && v.precoAntigo > v.preco && v.status === 'disponivel') s.push('<span class="selo selo-baixou">Baixou o preço</span>');
  return s.join('');
}

function card(loja, v, prefixo, urlBase) {
  const href = `${prefixo}carro/${v.slug}/`;
  const urlCarro = urlBase ? urlBase + `carro/${v.slug}/` : '';
  const status = v.status !== 'disponivel' ? `<span class="tarja tarja-${v.status}">${v.status === 'vendido' ? 'Vendido' : 'Reservado'}</span>` : '';
  return `<article class="card${v.status === 'vendido' ? ' card-vendido' : ''}" data-id="${esc(v.id)}" data-marca="${esc(v.marca)}" data-categoria="${esc(v.categoria)}" data-cambio="${esc(v.cambio)}" data-preco="${v.preco}" data-ano="${v.anoMod}" data-km="${v.km ?? 0}" data-status="${v.status}" data-entrada="${esc(v.entrada || '')}" data-busca="${esc(slugify(`${v.marca} ${v.modelo} ${v.versao || ''} ${v.categoria} ${v.cor || ''} ${v.anoMod}`).replace(/-/g, ' '))}">
  <a class="card-link" href="${href}">
    <div class="card-foto">${imgTag(v.fotos[0], v.nomeCompleto, { prefixo })}<div class="selos">${selosHtml(v)}</div>${status}${v.fotos.length > 1 ? `<span class="card-qtd">${v.fotos.length} fotos</span>` : ''}</div>
    <div class="card-corpo">
      <h3 class="card-titulo">${esc(v.titulo)}</h3>
      <p class="card-versao">${esc(v.versao || '')}</p>
      <ul class="card-specs"><li>${v.anoFab}/${v.anoMod}</li>${v.km != null ? `<li>${milhar(v.km)} km</li>` : ''}<li>${esc(v.cambio)}</li></ul>
      <p class="card-preco">${v.precoAntigo && v.precoAntigo > v.preco ? `<s>${brl(v.precoAntigo)}</s>` : ''}<strong>${v.status === 'vendido' ? 'Vendido' : brl(v.preco)}</strong></p>
    </div>
  </a>
  ${v.status === 'vendido'
    ? `<a class="card-wa card-wa-alt" href="${esc(wa(loja.whatsapp, prefixoMsg(loja) + `Olá! Vi que o ${v.nomeCompleto} já foi vendido. Vocês têm algum parecido?`))}" target="_blank" rel="noopener">Quero um parecido</a>`
    : `<a class="card-wa" href="${esc(wa(loja.whatsapp, msgInteresse(loja, v, urlCarro)))}" target="_blank" rel="noopener">${ICONE.wa}<span>Tenho interesse</span></a>`}
</article>`;
}

function ordemPadrao(a, b) {
  const peso = s => ({ disponivel: 0, reservado: 1, vendido: 2 }[s]);
  return peso(a.status) - peso(b.status) || (b.destaque === true) - (a.destaque === true) || String(b.entrada || '').localeCompare(String(a.entrada || ''));
}

// ---------- páginas ----------
function paginaInicial(loja, veiculos) {
  const disp = veiculos.filter(v => v.status !== 'vendido');
  const ordenados = [...veiculos].sort(ordemPadrao);
  const cats = [...new Set(veiculos.map(v => v.categoria))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const marcas = [...new Set(veiculos.map(v => v.marca))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const anos = [...new Set(veiculos.map(v => v.anoMod))].sort((a, b) => b - a);
  const cambios = [...new Set(veiculos.map(v => v.cambio))].sort();
  const faixas = [50000, 70000, 90000, 120000, 150000, 200000, 300000].filter(f => veiculos.some(v => v.preco <= f));
  const capa = ordenados.find(v => v.destaque) || ordenados[0];
  const titulo = `${loja.nome} — Seminovos em ${loja.cidade}`;
  const desc = `${disp.length} veículos à venda na ${loja.nome}, em ${loja.cidade}/${loja.uf}. ${loja.slogan || ''}`.trim();
  const img = capa.fotos[0].remota ? capa.fotos[0].grande : (loja.url ? loja.url + capa.fotos[0].grande : '');
  const dados = { loja: { nome: loja.nome, whatsapp: loja.whatsapp, modo: loja.modo || 'oficial' } };
  return `${head({ loja, titulo, descricao: desc, prefixo: '', canonical: loja.url, imagem: img })}
<body class="pg-inicio">
${topo(loja, '')}
<main>
  <section class="hero">
    <div class="hero-fundo" aria-hidden="true">${imgTag(capa.fotos[0], '', { grande: true, eager: true })}</div>
    <div class="wrap hero-in">
      <p class="hero-kicker">${ICONE.pin}<span>${esc(loja.cidade)} — ${esc(loja.uf)}</span></p>
      <h1>${esc(loja.titulo || `Seu próximo carro está na ${loja.nome}`)}</h1>
      ${loja.slogan ? `<p class="hero-sub">${esc(loja.slogan)}</p>` : ''}
      <form class="busca" role="search" id="busca-form">
        <label class="sr" for="busca">Buscar no estoque</label>
        ${ICONE.busca}
        <input id="busca" type="search" placeholder="Busque por marca, modelo ou ano" autocomplete="off" enterkeyhint="search">
        <button class="btn btn-cor" type="submit">Buscar</button>
      </form>
      <ul class="hero-vantagens">
        <li>${ICONE.check}<span><strong>${disp.length}</strong> veículos no pátio</span></li>
        ${loja.aceitaTroca ? `<li>${ICONE.check}<span>Aceitamos seu carro na troca</span></li>` : ''}
        ${loja.financiamento ? `<li>${ICONE.check}<span>Financiamento</span></li>` : ''}
      </ul>
    </div>
  </section>

  <section class="estoque" id="estoque">
    <div class="wrap">
      <div class="barra" id="barra">
        <div class="chips" role="group" aria-label="Categorias">
          <button class="chip ativo" type="button" data-cat="">Todos</button>
          ${cats.map(c => `<button class="chip" type="button" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}
        </div>
        <button class="btn btn-claro btn-sm filtros-toggle" type="button" aria-expanded="false" aria-controls="filtros">${ICONE.filtro}<span>Filtros</span></button>
        <div class="filtros" id="filtros">
          <label><span>Marca</span><select id="f-marca"><option value="">Todas</option>${marcas.map(m => `<option>${esc(m)}</option>`).join('')}</select></label>
          <label><span>Preço até</span><select id="f-preco"><option value="">Qualquer</option>${faixas.map(f => `<option value="${f}">${brl(f)}</option>`).join('')}</select></label>
          <label><span>Ano a partir de</span><select id="f-ano"><option value="">Qualquer</option>${anos.map(a => `<option>${a}</option>`).join('')}</select></label>
          <label><span>Câmbio</span><select id="f-cambio"><option value="">Todos</option>${cambios.map(c => `<option>${esc(c)}</option>`).join('')}</select></label>
          <label><span>Ordenar</span><select id="f-ordem"><option value="">Destaques</option><option value="preco-asc">Menor preço</option><option value="preco-desc">Maior preço</option><option value="ano-desc">Mais novos</option><option value="km-asc">Menor km</option></select></label>
        </div>
      </div>
      <p class="contagem" id="contagem" aria-live="polite">${veiculos.length} veículos</p>
      <div class="grade" id="grade">
        ${ordenados.map(v => card(loja, v, '', loja.url)).join('\n')}
      </div>
      <div class="vazio" id="vazio" hidden>
        <p><strong>Nenhum veículo com esses filtros.</strong></p>
        <p>Diga o que você procura que a gente avisa quando chegar.</p>
        <a class="btn btn-wa" id="vazio-wa" href="${esc(wa(loja.whatsapp, prefixoMsg(loja) + `Olá! Estou procurando um carro e não achei no site da ${loja.nome}. Procuro: `))}" target="_blank" rel="noopener">${ICONE.wa}<span>Pedir pelo WhatsApp</span></a>
      </div>
    </div>
  </section>

  ${loja.compramos ? `<section class="vender" id="vender">
    <div class="wrap vender-in">
      <div>
        <h2>Quer vender ou trocar seu carro?</h2>
        <p>Mande modelo, ano e quilometragem. A ${esc(loja.nome)} avalia e responde pelo WhatsApp.</p>
      </div>
      <form class="form-wa" data-tipo="vender">
        <label><span>Modelo</span><input name="modelo" required placeholder="Ex.: Onix LT 1.0" autocomplete="off"></label>
        <label><span>Ano</span><input name="ano" required inputmode="numeric" placeholder="Ex.: 2019" maxlength="9"></label>
        <label><span>Km</span><input name="km" inputmode="numeric" placeholder="Ex.: 60.000" maxlength="9"></label>
        <button class="btn btn-wa" type="submit">${ICONE.wa}<span>Pedir avaliação</span></button>
      </form>
    </div>
  </section>` : ''}

  <section class="loja" id="loja">
    <div class="wrap loja-in">
      <div>
        <h2>Visite a ${esc(loja.nome)}</h2>
        <p class="loja-linha">${ICONE.pin}<span>${esc(loja.endereco || `${loja.cidade} — ${loja.uf}`)}</span></p>
        ${(loja.horarios || []).length ? `<div class="loja-linha">${ICONE.relogio}<span>${loja.horarios.map(esc).join('<br>')}</span></div>` : ''}
      </div>
      <div class="loja-acoes">
        <a class="btn btn-wa" href="${esc(wa(loja.whatsapp, prefixoMsg(loja) + `Olá! Quero agendar uma visita na ${loja.nome}.`))}" target="_blank" rel="noopener">${ICONE.wa}<span>${fone(loja.whatsapp)}</span></a>
        ${loja.endereco && loja.modo !== 'demo' ? `<a class="btn btn-claro" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loja.nome}, ${loja.endereco}, ${loja.cidade} ${loja.uf}`)}" target="_blank" rel="noopener">${ICONE.pin}<span>Como chegar</span></a>` : ''}
        ${loja.instagram ? `<a class="btn btn-claro" href="${esc(loja.instagram)}" target="_blank" rel="noopener">${ICONE.insta}<span>Instagram</span></a>` : ''}
      </div>
    </div>
  </section>
</main>
${rodape(loja, '')}
<a class="wa-flutuante" href="${esc(wa(loja.whatsapp, prefixoMsg(loja) + `Olá! Vim pelo site da ${loja.nome}.`))}" target="_blank" rel="noopener" aria-label="Conversar no WhatsApp">${ICONE.wa}</a>
<script type="application/json" id="vm-dados">${jsonSeguro(dados)}</script>
<script src="assets/vitrine.js" defer></script>
</body>
</html>`;
}

function paginaCarro(loja, v, veiculos) {
  const p = '../../';
  const url = loja.url ? loja.url + `carro/${v.slug}/` : '';
  const titulo = `${v.nomeCompleto} — ${v.status === 'vendido' ? 'Vendido' : brl(v.preco)} | ${loja.nome}`;
  const desc = `${v.nomeCompleto}${v.km != null ? `, ${milhar(v.km)} km` : ''}, ${v.cambio}, ${v.combustivel}. ${v.status === 'vendido' ? 'Vendido.' : brl(v.preco) + '.'} ${loja.nome}, ${loja.cidade}/${loja.uf}.`;
  const img = v.fotos[0].remota ? v.fotos[0].grande : (loja.url ? loja.url + v.fotos[0].grande : '');
  const parecidos = veiculos.filter(o => o.id !== v.id && o.status !== 'vendido')
    .map(o => ({ o, d: (o.categoria === v.categoria ? 0 : 1) + Math.abs(o.preco - v.preco) / v.preco }))
    .sort((a, b) => a.d - b.d).slice(0, 3).map(x => x.o);
  const specs = [
    ['Ano', `${v.anoFab}/${v.anoMod}`], ['Quilometragem', v.km != null ? `${milhar(v.km)} km` : ''], ['Câmbio', v.cambio], ['Combustível', v.combustivel],
    ['Cor', v.cor], ['Portas', v.portas], ['Final da placa', v.finalPlaca], ['Categoria', v.categoria],
  ].filter(([, val]) => val !== undefined && val !== '' && val !== null);
  const ld = {
    '@context': 'https://schema.org', '@type': 'Car', name: v.nomeCompleto, brand: { '@type': 'Brand', name: v.marca }, model: v.modelo,
    vehicleModelDate: String(v.anoMod), productionDate: String(v.anoFab), fuelType: v.combustivel, vehicleTransmission: v.cambio, color: v.cor || undefined,
    mileageFromOdometer: v.km != null ? { '@type': 'QuantitativeValue', value: v.km, unitCode: 'KMT' } : undefined,
    image: v.fotos.map(f => f.remota ? f.grande : (loja.url ? loja.url + f.grande : '')).filter(Boolean), url: url || undefined,
    offers: { '@type': 'Offer', price: v.preco, priceCurrency: 'BRL', availability: v.status === 'vendido' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock', seller: { '@type': 'AutoDealer', name: loja.nome, address: { '@type': 'PostalAddress', addressLocality: loja.cidade, addressRegion: loja.uf, addressCountry: 'BR' } } },
  };
  const dados = { loja: { nome: loja.nome, whatsapp: loja.whatsapp, modo: loja.modo || 'oficial' }, carro: { id: v.id, nome: v.nomeCompleto, preco: v.preco, precoTxt: brl(v.preco), url, status: v.status } };
  const creditos = v.fotos.filter(f => f.autor);
  const msg = msgInteresse(loja, v, url);
  return `${head({ loja, titulo, descricao: desc, prefixo: p, canonical: url, imagem: img, extra: `<script type="application/ld+json">${jsonSeguro(ld)}</script>` })}
<body class="pg-carro">
${topo(loja, p)}
<main class="wrap carro">
  <a class="voltar" href="${p}#estoque">${ICONE.voltar}<span>Voltar ao estoque</span></a>
  <div class="carro-grid">
    <section class="galeria" aria-label="Fotos do veículo">
      <div class="galeria-trilho" id="trilho" tabindex="0">
        ${v.fotos.map((f, i) => `<figure class="galeria-item">${imgTag(f, `${v.nomeCompleto} — foto ${i + 1}`, { grande: true, prefixo: p, eager: i === 0 })}</figure>`).join('')}
      </div>
      ${v.fotos.length > 1 ? `<button class="galeria-btn ant" type="button" aria-label="Foto anterior">${ICONE.voltar}</button><button class="galeria-btn prox" type="button" aria-label="Próxima foto">${ICONE.seta}</button><span class="galeria-cont" id="galeria-cont">1 / ${v.fotos.length}</span>` : ''}
      ${v.status !== 'disponivel' ? `<span class="tarja tarja-${v.status} tarja-grande">${v.status === 'vendido' ? 'Vendido' : 'Reservado'}</span>` : ''}
      ${v.fotos.length > 1 ? `<div class="miniaturas">${v.fotos.map((f, i) => `<button type="button" class="mini${i === 0 ? ' ativa' : ''}" data-i="${i}" aria-label="Ver foto ${i + 1}">${imgTag(f, '', { prefixo: p })}</button>`).join('')}</div>` : ''}
    </section>

    <section class="info">
      <div class="selos selos-info">${selosHtml(v)}${(v.selos || []).map(s => `<span class="selo">${esc(s)}</span>`).join('')}</div>
      <h1 class="info-titulo">${esc(v.titulo)} <span>${esc(v.versao || '')}</span></h1>
      <p class="info-preco">${v.precoAntigo && v.precoAntigo > v.preco && v.status !== 'vendido' ? `<s>${brl(v.precoAntigo)}</s>` : ''}<strong>${v.status === 'vendido' ? 'Vendido' : brl(v.preco)}</strong></p>
      ${v.status === 'reservado' ? '<p class="aviso-status">Este veículo está reservado. Fale com a loja para entrar na fila ou ver opções parecidas.</p>' : ''}
      ${v.status === 'vendido' ? '<p class="aviso-status">Este veículo já foi vendido. A loja pode ter outro parecido.</p>' : ''}
      <dl class="specs">${specs.map(([k, val]) => `<div><dt>${esc(k)}</dt><dd>${esc(val)}</dd></div>`).join('')}</dl>
      <div class="acoes">
        ${v.status === 'vendido'
          ? `<a class="btn btn-wa btn-grande" href="${esc(wa(loja.whatsapp, prefixoMsg(loja) + `Olá! Vi que o ${v.nomeCompleto} já foi vendido. Vocês têm algum parecido?`))}" target="_blank" rel="noopener">${ICONE.wa}<span>Quero um parecido</span></a>`
          : `<a class="btn btn-wa btn-grande" href="${esc(wa(loja.whatsapp, msg))}" target="_blank" rel="noopener">${ICONE.wa}<span>Tenho interesse</span></a>`}
        <button class="btn btn-claro" type="button" id="compartilhar">${ICONE.share}<span>Compartilhar</span></button>
      </div>
      ${v.status !== 'vendido' ? `<div class="sanfona">
        ${loja.financiamento ? `<details>
          <summary>Simular financiamento</summary>
          <form class="form-wa" data-tipo="financiamento">
            <label><span>Entrada (R$)</span><input name="entrada" inputmode="numeric" placeholder="Ex.: 20.000" maxlength="12"></label>
            <label><span>Parcelas</span><select name="prazo"><option>24x</option><option>36x</option><option selected>48x</option><option>60x</option></select></label>
            <label class="largo"><span>Seu nome</span><input name="nome" autocomplete="given-name" maxlength="60"></label>
            <p class="form-nota largo">A loja responde com as condições. Não envie documentos por aqui.</p>
            <button class="btn btn-wa largo" type="submit">${ICONE.wa}<span>Enviar para a loja</span></button>
          </form>
        </details>` : ''}
        ${loja.aceitaTroca ? `<details>
          <summary>Avaliar meu carro na troca</summary>
          <form class="form-wa" data-tipo="troca">
            <label class="largo"><span>Seu carro</span><input name="modelo" required placeholder="Ex.: Gol 1.0" maxlength="60"></label>
            <label><span>Ano</span><input name="ano" required inputmode="numeric" placeholder="Ex.: 2018" maxlength="9"></label>
            <label><span>Km</span><input name="km" inputmode="numeric" placeholder="Ex.: 80.000" maxlength="9"></label>
            <button class="btn btn-wa largo" type="submit">${ICONE.wa}<span>Pedir avaliação</span></button>
          </form>
        </details>` : ''}
        <details>
          <summary>Agendar visita ou test drive</summary>
          <form class="form-wa" data-tipo="visita">
            <label><span>Dia</span><select name="dia"><option>Hoje</option><option>Amanhã</option><option>Nesta semana</option><option>No sábado</option></select></label>
            <label><span>Período</span><select name="periodo"><option>Manhã</option><option>Tarde</option></select></label>
            <button class="btn btn-wa largo" type="submit">${ICONE.wa}<span>Agendar pelo WhatsApp</span></button>
          </form>
        </details>
      </div>` : ''}
      ${(v.opcionais || []).length ? `<h2 class="info-sub">Itens e opcionais</h2><ul class="opcionais">${v.opcionais.map(o => `<li>${ICONE.check}<span>${esc(o)}</span></li>`).join('')}</ul>` : ''}
      ${v.descricao ? `<h2 class="info-sub">Sobre este veículo</h2><p class="descricao">${esc(v.descricao)}</p>` : ''}
    </section>
  </div>

  ${parecidos.length ? `<section class="parecidos"><h2>Você também pode gostar</h2><div class="grade grade-3">${parecidos.map(o => card(loja, o, p, loja.url)).join('')}</div></section>` : ''}
  ${creditos.length ? `<p class="creditos">Fotos: ${creditos.map(f => `${f.fonte ? `<a href="${esc(f.fonte)}" rel="noopener nofollow" target="_blank">${esc(f.autor)}</a>` : esc(f.autor)} (${esc(f.licenca)})`).join(' · ')}, via Wikimedia Commons. Imagens ilustrativas.</p>` : ''}
</main>
${v.status !== 'vendido' ? `<div class="barra-fixa"><div><small>${esc(v.titulo)} ${v.anoMod}</small><strong>${brl(v.preco)}</strong></div><a class="btn btn-wa" href="${esc(wa(loja.whatsapp, msg))}" target="_blank" rel="noopener">${ICONE.wa}<span>Tenho interesse</span></a></div>` : ''}
${rodape(loja, p)}
<div class="toast" id="toast" role="status" hidden></div>
<script type="application/json" id="vm-dados">${jsonSeguro(dados)}</script>
<script src="${p}assets/vitrine.js" defer></script>
</body>
</html>`;
}

function paginaArtes(loja, veiculos) {
  const p = '../';
  const lista = [...veiculos].sort(ordemPadrao);
  const dados = {
    loja: { nome: loja.nome, whatsapp: loja.whatsapp, fone: fone(loja.whatsapp), cor: loja.cores.primaria, escura: loja.cores.escura || '#111317', site: (loja.url || '').replace(/^https?:\/\//, '').replace(/\/$/, ''), logo: loja.logo ? `${p}assets/${path.basename(loja.logo)}` : '' },
    carros: lista.map(v => ({ id: v.id, titulo: v.titulo, versao: v.versao || '', ano: `${v.anoFab}/${v.anoMod}`, km: v.km != null ? `${milhar(v.km)} km` : '', cambio: v.cambio, combustivel: v.combustivel, preco: brl(v.preco), precoAntigo: v.precoAntigo && v.precoAntigo > v.preco ? brl(v.precoAntigo) : '', status: v.status, foto: v.fotos[0].remota ? v.fotos[0].grande : p + v.fotos[0].grande, cors: v.fotos[0].cors !== false, selo: v.novo ? 'Novo no estoque' : (v.precoAntigo > v.preco ? 'Baixou o preço' : (v.selos || [])[0] || '') })),
  };
  return `${head({ loja: { ...loja, indexar: false }, titulo: `Artes para status e stories — ${loja.nome}`, descricao: 'Gere as artes dos carros para postar no status do WhatsApp e no Instagram.', prefixo: p })}
<body class="pg-artes">
${topo(loja, p)}
<main class="wrap artes">
  <h1>Artes dos carros</h1>
  <p class="artes-sub">Toque em um formato para gerar a arte. No celular, ela abre direto para compartilhar no status do WhatsApp ou no Instagram.</p>
  ${veiculos.some(v => v.fotos[0].cors === false) ? '<p class="aviso-status">Nesta prévia as fotos vêm do anúncio em outro site, que não permite gerar artes. No site oficial, com as fotos enviadas pela loja, as artes funcionam em todos os carros.</p>' : ''}
  <div class="artes-grade">
    ${lista.map(v => `<article class="arte-item${v.status === 'vendido' ? ' arte-vendido' : ''}">
      ${imgTag(v.fotos[0], v.nomeCompleto, { prefixo: p })}
      <div class="arte-corpo">
        <h2>${esc(v.titulo)} <small>${esc(v.versao || '')}</small></h2>
        <p>${v.anoFab}/${v.anoMod} · ${v.status === 'vendido' ? 'Vendido' : brl(v.preco)}</p>
        <div class="arte-botoes">
          ${v.status === 'vendido'
            ? `<button class="btn btn-cor btn-sm" type="button" data-arte="vendido" data-id="${esc(v.id)}">Arte "Vendido"</button>`
            : `<button class="btn btn-cor btn-sm" type="button" data-arte="story" data-id="${esc(v.id)}">Status / Story</button><button class="btn btn-claro btn-sm" type="button" data-arte="feed" data-id="${esc(v.id)}">Feed</button><button class="btn btn-claro btn-sm" type="button" data-arte="vendido" data-id="${esc(v.id)}">Vendido</button>`}
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
<script type="application/json" id="vm-artes">${jsonSeguro(dados)}</script>
<script src="${p}assets/artes.js" defer></script>
</body>
</html>`;
}

function icone(loja) {
  const iniciais = (loja.nomeCurto || loja.nome).split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${loja.cores.primaria}"/><text x="32" y="42" font-family="Arial, sans-serif" font-size="26" font-weight="800" text-anchor="middle" fill="${luminancia(loja.cores.primaria) > 0.45 ? '#111' : '#fff'}">${esc(iniciais)}</text></svg>`;
}

function tema(loja) {
  const cor = loja.cores.primaria, esc2 = loja.cores.escura || '#111317';
  const txt = luminancia(cor) > 0.45 ? '#111317' : '#ffffff';
  return `:root{--cor:${cor};--cor-txt:${txt};--escura:${esc2};}\n`;
}

// ---------- montar ----------
async function gerar(slug) {
  const { dir, loja, veiculos } = carregar(slug);
  if (loja.url && !loja.url.endsWith('/')) loja.url += '/';
  const out = path.join(SAIDA, slug);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, 'assets', 'fontes'), { recursive: true });
  await prepararFotos(dir, out, veiculos);
  for (const f of ['estilo.css', 'vitrine.js', 'artes.js']) fs.copyFileSync(path.join(MODELO, f), path.join(out, 'assets', f));
  for (const f of fs.readdirSync(path.join(MODELO, 'fontes'))) fs.copyFileSync(path.join(MODELO, 'fontes', f), path.join(out, 'assets', 'fontes', f));
  if (loja.logo) fs.copyFileSync(path.join(dir, loja.logo), path.join(out, 'assets', path.basename(loja.logo)));
  fs.writeFileSync(path.join(out, 'assets', 'tema.css'), tema(loja));
  fs.writeFileSync(path.join(out, 'assets', 'icone.svg'), icone(loja));
  fs.writeFileSync(path.join(out, 'index.html'), paginaInicial(loja, veiculos));
  for (const v of veiculos) {
    const d = path.join(out, 'carro', v.slug);
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'index.html'), paginaCarro(loja, v, veiculos));
  }
  fs.mkdirSync(path.join(out, 'artes'), { recursive: true });
  fs.writeFileSync(path.join(out, 'artes', 'index.html'), paginaArtes(loja, veiculos));
  if (loja.indexar && loja.url) {
    fs.writeFileSync(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>${esc(loja.url)}</loc></url>\n${veiculos.filter(v => v.status !== 'vendido').map(v => `<url><loc>${esc(loja.url)}carro/${v.slug}/</loc></url>`).join('\n')}\n</urlset>\n`);
    fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nDisallow: /artes/\nSitemap: ${loja.url}sitemap.xml\n`);
  }
  const disp = veiculos.filter(v => v.status === 'disponivel').length;
  console.log(`OK ${slug}: ${veiculos.length} veículos (${disp} disponíveis) -> saida/${slug}/`);
}

function novo(slug) {
  if (!/^[a-z0-9-]+$/.test(slug || '')) falha('use um nome só com letras minúsculas, números e hífen. Ex.: rr-multimarcas');
  const dir = path.join(CLIENTES, slug);
  if (fs.existsSync(dir)) falha(`clientes/${slug} já existe`);
  fs.mkdirSync(path.join(dir, 'fotos'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'loja.json'), JSON.stringify({
    nome: 'Nome da Revenda', nomeCurto: 'Nome', slogan: '', cidade: 'Cidade', uf: 'SP', endereco: '', whatsapp: '55DDDNUMERO', instagram: '',
    horarios: ['Seg a sex: 8h às 18h', 'Sábado: 8h às 13h'], cnpj: '', cores: { primaria: '#E11D48', escura: '#111317' }, logo: '',
    url: `${MARCA.url}previa/${slug}/`, aceitaTroca: true, financiamento: true, compramos: true, modo: 'previa', indexar: false,
  }, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'estoque.json'), JSON.stringify({ veiculos: [{
    id: '1', marca: 'Marca', modelo: 'Modelo', versao: 'Versão', anoFab: 2020, anoMod: 2021, km: 50000, preco: 70000, precoAntigo: null,
    categoria: 'Hatch', cambio: 'Manual', combustivel: 'Flex', cor: '', portas: 4, finalPlaca: '', selos: [], destaque: false, status: 'disponivel',
    entrada: new Date().toISOString().slice(0, 10), opcionais: [], descricao: '', fotos: [{ arquivo: 'carro1-1.jpg' }],
  }] }, null, 2) + '\n');
  console.log(`Criado clientes/${slug}/. Preencha loja.json e estoque.json, coloque as fotos em fotos/ e rode: node gerar.mjs ${slug}`);
}

const [cmd, arg] = process.argv.slice(2);
await carregarSharp();
if (!cmd) falha('uso: node gerar.mjs <slug> | todos | novo <slug>');
else if (cmd === 'novo') novo(arg);
else if (cmd === 'todos') { for (const s of fs.readdirSync(CLIENTES)) if (fs.existsSync(path.join(CLIENTES, s, 'loja.json'))) await gerar(s); }
else await gerar(cmd);
