#!/usr/bin/env node
// Monta a pasta publicar/ com tudo que vai ao ar no projeto Cloudflare Pages da Vitrine Motor:
//   /            site de vendas (2-Site)
//   /demo/       revenda de demonstração (3-Produto/saida/modelo-multimarcas)
//   /previa/x/   prévias feitas para revendas reais (clientes com "modo": "previa")
// Não publica nada: só monta. Para publicar, use publicar.ps1.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { copiarGrupo, marca as marcaGrupo } from '../../grupo/grupo-node.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(RAIZ, 'publicar');
const PRODUTO = path.join(RAIZ, '3-Produto');

execFileSync(process.execPath, [path.join(PRODUTO, 'gerar.mjs'), 'todos'], { stdio: 'inherit' });

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(RAIZ, '2-Site'), OUT, { recursive: true });
copiarGrupo(OUT); // selo + botão de troca do Grupo Vorkeza (fonte: ../grupo/)

const previas = [];
for (const slug of fs.readdirSync(path.join(PRODUTO, 'clientes'))) {
  const arq = path.join(PRODUTO, 'clientes', slug, 'loja.json');
  if (!fs.existsSync(arq)) continue;
  const loja = JSON.parse(fs.readFileSync(arq, 'utf8'));
  const src = path.join(PRODUTO, 'saida', slug);
  if (loja.modo === 'demo') fs.cpSync(src, path.join(OUT, 'demo'), { recursive: true });
  else if (loja.modo === 'previa') { fs.cpSync(src, path.join(OUT, 'previa', slug), { recursive: true }); previas.push(slug); }
  // Clientes "oficial" vão para o projeto Cloudflare próprio de cada revenda (ver 3-Produto/LEIA-ME.md).
}

const csp = "default-src 'self'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
fs.writeFileSync(path.join(OUT, '_headers'), `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Frame-Options: DENY

/previa/*
  X-Robots-Tag: noindex, nofollow

/demo/*
  X-Robots-Tag: noindex, nofollow

/*/artes/*
  X-Robots-Tag: noindex, nofollow
`);
const MARCA = JSON.parse(fs.readFileSync(path.join(RAIZ, 'marca.json'), 'utf8'));
MARCA.url = marcaGrupo('vitrinemotor').url;
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nDisallow: /previa/\nDisallow: /demo/\nSitemap: ${MARCA.url}sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${MARCA.url}</loc></url></urlset>\n`);
console.log(`publicar/ montado: site + demo${previas.length ? ' + prévias: ' + previas.join(', ') : ''}`);
