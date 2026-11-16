#!/usr/bin/env node
// Monta a pasta publicar/ com tudo que vai ao ar no projeto Cloudflare Pages do Bem no Mapa:
//   /            site de vendas (2-Site) + grupo/ (selo e botão de troca do Grupo Vorkeza)
//   /demo/       raio-x de exemplo (clientes com "modo": "demo")
//   /previa/x/   raio-x feitos para negócios reais (clientes com "modo": "previa")
// Não publica nada: só monta. Para publicar, use publicar.ps1.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { copiarGrupo, marca } from '../../grupo/grupo-node.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(RAIZ, 'publicar');
const PRODUTO = path.join(RAIZ, '3-Produto');
const URL_SITE = marca('bemnomapa').url;

execFileSync(process.execPath, [path.join(PRODUTO, 'gerar-raio-x.mjs'), 'todos'], { stdio: 'inherit' });
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(RAIZ, '2-Site'), OUT, { recursive: true });
copiarGrupo(OUT);

const previas = [];
for (const slug of fs.readdirSync(path.join(PRODUTO, 'clientes'))) {
  const arq = path.join(PRODUTO, 'clientes', slug, 'raio-x.json');
  if (!fs.existsSync(arq)) continue;
  const modo = JSON.parse(fs.readFileSync(arq, 'utf8')).negocio.modo;
  const src = path.join(PRODUTO, 'saida', slug);
  if (modo === 'demo') fs.cpSync(src, path.join(OUT, 'demo'), { recursive: true });
  else if (modo === 'previa') { fs.cpSync(src, path.join(OUT, 'previa', slug), { recursive: true }); previas.push(slug); }
}

const csp = "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
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
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nDisallow: /previa/\nDisallow: /demo/\nSitemap: ${URL_SITE}sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${URL_SITE}</loc></url></urlset>\n`);
console.log(`publicar/ montado: site + demo${previas.length ? ' + raio-x: ' + previas.join(', ') : ''}`);
