// Ajuda os geradores (Node) de cada marca a usar o grupo.json e copiar a pasta grupo/ para o que vai ao ar.
//   import { grupo, marca, copiarGrupo, seloHtml } from '../../grupo/grupo-node.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PASTA_GRUPO = path.dirname(fileURLToPath(import.meta.url));

export function grupo() { return JSON.parse(fs.readFileSync(path.join(PASTA_GRUPO, 'grupo.json'), 'utf8')); }
export function marca(id) {
  const g = grupo(); const m = g.marcas.find(x => x.id === id);
  if (!m) throw new Error(`marca "${id}" não está em grupo/grupo.json`);
  return m;
}
export function mae() { const g = grupo(); return g.marcas.find(x => x.id === g.mae); }

// Copia grupo.css, grupo.js, grupo.json e as fontes para <destino>/grupo/
export function copiarGrupo(destino) {
  const out = path.join(destino, 'grupo');
  fs.mkdirSync(path.join(out, 'fontes'), { recursive: true });
  for (const f of ['grupo.css', 'grupo.js', 'grupo.json', 'site-marca.css', 'site-marca.js', 'movimento.css', 'movimento.js']) if (fs.existsSync(path.join(PASTA_GRUPO, f))) fs.copyFileSync(path.join(PASTA_GRUPO, f), path.join(out, f));
  for (const f of fs.readdirSync(path.join(PASTA_GRUPO, 'fontes'))) fs.copyFileSync(path.join(PASTA_GRUPO, 'fontes', f), path.join(out, 'fontes', f));
  return out;
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Texto de rodapé estático, para páginas sem grupo.js (sites de clientes):
// "Site feito pela <Marca> — uma empresa Vorkeza", com links vindos do grupo.json.
export function creditoHtml(id, prefixo = 'Site feito pela') {
  const m = marca(id), v = mae();
  return `${esc(prefixo)} <a href="${esc(m.url)}" rel="noopener">${esc(m.nome)}</a> — uma empresa <a class="vk-mae-link" href="${esc(v.url)}" rel="noopener">${esc(v.nome.split(' ')[0])}</a>`;
}
