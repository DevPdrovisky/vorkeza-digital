#!/usr/bin/env node
// Boca a Boca — gera, para cada loja em clientes/<slug>/:
//   saida/<slug>/index.html            página da loja (para onde o QR leva)
//   saida/<slug>/placa/index.html      plaquinha de balcão + adesivo, na cor da loja (PNG/PDF: ferramentas/placas.cjs)
//   saida/<slug>/relatorio/index.html  relatório do mês (se existir relatorio.json)
//
//   node gerar.mjs <slug> | todos | novo <slug>
//
// modo: "demo" (loja de exemplo), "previa" (arte para mostrar; placeId opcional) ou "cliente" (no ar; placeId obrigatório).
// REGRA DA MARCA: sem filtro de avaliação. Todo cliente vê o botão da avaliação pública, sempre, em primeiro lugar.
// A mensagem privada é um extra, nunca um caminho que substitui ou esconde a avaliação.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { creditoHtml, marca as marcaGrupo } from '../../grupo/grupo-node.mjs';

const qrcode = createRequire('C:/Users/cmraj/Desktop/PrixPablo/site/node_modules/x.js')('qrcode-generator');
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CLIENTES = path.join(ROOT, 'clientes'), SAIDA = path.join(ROOT, 'saida'), MODELO = path.join(ROOT, 'modelo');
const FONTES = path.join(ROOT, '..', '..', 'grupo', 'fontes');
const MARCA = JSON.parse(fs.readFileSync(path.join(ROOT, '..', 'marca.json'), 'utf8'));
const G = marcaGrupo('bocaaboca'); MARCA.url = G.url; MARCA.nome = G.nome;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tem = v => v !== null && v !== undefined && v !== '';
const AC = 'A confirmar';
const wa = (num, msg) => `https://wa.me/${String(num).replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
const falha = m => { console.error('ERRO: ' + m); process.exit(1); };
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const mesBR = m => { const [a, n] = m.split('-'); return `${MESES[+n - 1]} de ${a}`; };
const num = v => tem(v) ? String(v) : AC;
const nota = v => tem(v) ? v.toFixed(1).replace('.', ',') : AC;

function lum(hex) {
  const c = hex.replace('#', '').match(/../g).map(x => parseInt(x, 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
}
const txtSobre = cor => lum(cor) > .38 ? '#1B1408' : '#FFFFFF';

const ESTRELA = 'M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2 6.3 20.3l1.2-6.4L2.8 9.5l6.4-.8z';
const estrelas = (n = 5) => `<span class="estrelas" aria-hidden="true">${Array.from({ length: n }, () => `<svg viewBox="0 0 24 24"><path d="${ESTRELA}"/></svg>`).join('')}</span>`;

function qrSvg(texto, cor) {
  const q = qrcode(0, 'M'); q.addData(texto); q.make();
  const n = q.getModuleCount(); let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
  return `<svg class="qr" viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges" role="img" aria-label="Código QR"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="${cor}"/></svg>`;
}

function urls(slug, loja) {
  const pagina = loja.url || (loja.modo === 'demo' ? MARCA.url + 'demo/' : MARCA.url + 'l/' + slug + '/');
  let avaliar = null;
  if (loja.placeId) avaliar = 'https://search.google.com/local/writereview?placeid=' + encodeURIComponent(loja.placeId);
  else if (loja.linkAvaliacao) avaliar = loja.linkAvaliacao;
  if (!avaliar && loja.modo === 'cliente') falha(`${slug}: cliente precisa de placeId ou linkAvaliacao (sem isso o botão de avaliar não funciona)`);
  return { pagina, avaliar };
}

const head = (titulo, extra = '', css = 'assets/avalia.css') => `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="robots" content="noindex">
${extra}<link rel="icon" href="${css.replace('avalia.css', 'icone.svg')}" type="image/svg+xml">
<link rel="stylesheet" href="${css}">
</head>`;

function paginaLoja(slug, loja) {
  const { avaliar } = urls(slug, loja);
  const demo = loja.modo === 'demo';
  const zap = loja.whatsappSugestao || (demo ? MARCA.whatsapp : null);
  const msg = demo ? 'Teste da demonstração do Boca a Boca: mensagem privada para a loja.' : `Olá, ${loja.nome}! Tenho uma sugestão: `;
  const tc = txtSobre(loja.cor);
  return `${head(`Avalie a ${loja.nome}`, `<meta name="theme-color" content="${esc(loja.cor)}">\n`)}
<body class="av" style="--c:${esc(loja.cor)};--c-txt:${tc}">
${demo ? `<p class="faixa-demo">Loja fictícia para demonstração. <a href="${esc(MARCA.url)}">Quer isso na sua loja? Conheça o Boca a Boca</a></p>` : ''}
<main class="av-in">
  <header class="av-loja">
    <span class="av-ini" aria-hidden="true">${esc(loja.nome.trim()[0])}</span>
    <div><h1>${esc(loja.nome)}</h1><p>${esc([loja.ramo, `${loja.cidade} — ${loja.uf}`].filter(Boolean).join(' · '))}</p></div>
  </header>

  <section class="av-card av-principal" aria-labelledby="t-avaliar">
    ${estrelas()}
    <h2 id="t-avaliar">Como foi a sua experiência?</h2>
    <p>Conte para a cidade. Sua avaliação é pública, leva menos de 1 minuto e <strong>toda opinião é bem-vinda, boa ou ruim</strong>.</p>
    <a class="av-btn" href="${avaliar ? esc(avaliar) : '#demo-aviso'}"${avaliar ? ' rel="noopener"' : ''}>Deixar minha avaliação no Google</a>
    <p class="av-mini">Abre a tela de avaliação do perfil da loja. Você escolhe as estrelas e escreve lá.</p>
    ${!avaliar ? '<p class="av-aviso" id="demo-aviso">' + (demo ? 'Na loja de verdade, este botão abre direto a tela para escrever a avaliação no perfil da loja.' : 'Prévia de demonstração: o perfil da loja no mapa ainda está a confirmar. Quando ele existir, este botão abre direto a tela para escrever a avaliação.') + '</p>' : ''}
  </section>

  ${zap ? `<section class="av-card av-priv" aria-labelledby="t-priv">
    <h2 id="t-priv">Quer falar algo só com a gente?</h2>
    <p>Uma sugestão, um elogio para alguém da equipe ou algo para resolver. A mensagem vai direto para a loja. <strong>Não substitui a avaliação:</strong> você pode fazer as duas coisas.</p>
    <a class="av-btn2" href="${esc(wa(zap, msg))}" rel="noopener">Mandar mensagem privada</a>
  </section>` : ''}
</main>
<footer class="av-rodape"><p>${creditoHtml('bocaaboca', 'Página feita pelo')}</p><p class="av-indep">Serviço independente, sem vínculo com o Google.</p></footer>
</body>
</html>
`;
}

function paginaPlaca(slug, loja) {
  const { pagina } = urls(slug, loja);
  const tc = txtSobre(loja.cor);
  const qrCor = lum(loja.cor) < .2 ? loja.cor : '#1B1408';
  const p = loja.placa || {};
  const titulo = p.titulo || 'Sua opinião conta';
  const texto = p.texto || 'Aponte a câmera do celular para o código e conte como foi.';
  const qr = qrSvg(pagina, qrCor);
  const selo = loja.modo === 'previa' && !loja.placeId && !loja.linkAvaliacao ? '<p class="selo-previa">PRÉVIA · QR de demonstração · perfil da loja a confirmar</p>' : '';
  const end = pagina.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `${head(`Plaquinhas — ${loja.nome}`, '', '../assets/avalia.css')}
<body class="placas" style="--c:${esc(loja.cor)};--c-txt:${tc}">
<header class="placas-topo">
  <h1>Plaquinhas da ${esc(loja.nome)}</h1>
  <p>Plaquinha de balcão (10,5 × 14,8 cm) e adesivo (9 × 9 cm), na cor da loja. O código leva para <b>${esc(end)}</b>.</p>
  <p class="placas-baixar"><a href="placa.png" download>Plaquinha PNG</a><a href="placa.pdf" download>Plaquinha PDF</a><a href="adesivo.png" download>Adesivo PNG</a><a href="adesivo.pdf" download>Adesivo PDF</a></p>
</header>
<div class="placas-grade">
  <article class="peca placa" data-peca="placa" data-mm="105x148">${selo}
    <div class="placa-topo">${estrelas()}<h2>${esc(titulo)}</h2></div>
    <div class="placa-qr">${qr}</div>
    <p class="placa-txt">${esc(texto)}</p>
    <p class="placa-loja">${esc(loja.nome)}</p>
    <p class="placa-end">${esc(end)}</p>
  </article>
  <article class="peca adesivo" data-peca="adesivo" data-mm="90x90">${selo}
    <div class="adesivo-qr">${qr}</div>
    <div class="adesivo-txt">${estrelas()}<h2>${esc(titulo)}</h2><p>Aponte a câmera e avalie a ${esc(loja.nome)}</p></div>
  </article>
</div>
</body>
</html>
`;
}

function paginaRelatorio(slug, loja, r) {
  const novas = tem(r.avaliacoesFim) && tem(r.avaliacoesInicio) ? r.avaliacoesFim - r.avaliacoesInicio : null;
  const tile = (rot, val, det) => `<div class="tile"><p class="tile-rot">${rot}</p><p class="tile-val">${val}</p>${det ? `<p class="tile-det">${det}</p>` : ''}</div>`;
  const hist = (r.historico || []).map(h => `<tr><th scope="row">${esc(mesBR(h.mes))}</th><td>${num(h.acessos)}</td><td>${num(h.novas)}</td><td>${nota(h.nota)}</td></tr>`).join('');
  return `${head(`Relatório de ${mesBR(r.mes)} — ${loja.nome}`, '', '../assets/avalia.css')}
<body class="rel" style="--c:${esc(loja.cor)};--c-txt:${txtSobre(loja.cor)}">
${r.exemplo ? '<p class="faixa-demo">Relatório de exemplo, com loja e números fictícios.</p>' : ''}
<header class="rel-topo"><div class="rel-wrap"><p class="rel-kicker">Relatório do mês · Boca a Boca</p><h1>${esc(loja.nome)}</h1><p>${esc(mesBR(r.mes))}</p></div></header>
<main class="rel-in">
  <section class="tiles" aria-label="Números do mês">
    ${tile('Acessos pela plaquinha', num(r.acessos), 'pessoas que abriram a página da loja')}
    ${tile('Avaliações novas', novas === null ? AC : '+' + novas, tem(r.avaliacoesFim) ? `total: ${r.avaliacoesFim}` : '')}
    ${tile('Nota média', nota(r.notaFim), tem(r.notaInicio) ? `era ${nota(r.notaInicio)} no início do mês` : '')}
    ${tile('Avaliações respondidas', num(r.respondidas), novas !== null && tem(r.respondidas) ? `de ${novas} novas` : '')}
    ${tile('Mensagens privadas', num(r.sugestoes), 'sugestões recebidas no WhatsApp')}
  </section>
  ${hist ? `<section class="rel-bloco"><h2>Mês a mês</h2><div class="rel-tab-box"><table class="rel-tab"><thead><tr><th scope="col">Mês</th><th scope="col">Acessos</th><th scope="col">Avaliações novas</th><th scope="col">Nota</th></tr></thead><tbody>${hist}</tbody></table></div></section>` : ''}
  ${r.observacoes?.length ? `<section class="rel-bloco"><h2>O que vimos</h2><ul>${r.observacoes.map(o => `<li>${esc(o)}</li>`).join('')}</ul></section>` : ''}
  <p class="rel-nota">Acessos: estatística da página da loja. Avaliações e nota: perfil público no primeiro e no último dia do mês. Nenhuma avaliação é filtrada: todo cliente vê o botão de avaliação pública.</p>
</main>
<footer class="av-rodape"><p>${creditoHtml('bocaaboca', 'Relatório feito pelo')}</p></footer>
</body>
</html>
`;
}

function gerar(slug) {
  const arq = path.join(CLIENTES, slug, 'loja.json');
  if (!fs.existsSync(arq)) falha(`clientes/${slug}/loja.json não existe`);
  const loja = JSON.parse(fs.readFileSync(arq, 'utf8'));
  if (!loja.nome || !loja.cidade) falha(`${slug}: loja.json sem nome ou cidade`);
  if (!/^#[0-9a-fA-F]{6}$/.test(loja.cor || '')) falha(`${slug}: cor deve ser #RRGGBB`);
  const out = path.join(SAIDA, slug);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, 'assets', 'fontes'), { recursive: true });
  fs.mkdirSync(path.join(out, 'placa'), { recursive: true });
  fs.copyFileSync(path.join(MODELO, 'avalia.css'), path.join(out, 'assets', 'avalia.css'));
  fs.copyFileSync(path.join(ROOT, '..', '2-Site', 'assets', 'logo.svg'), path.join(out, 'assets', 'icone.svg'));
  for (const f of fs.readdirSync(FONTES)) fs.copyFileSync(path.join(FONTES, f), path.join(out, 'assets', 'fontes', f));
  fs.writeFileSync(path.join(out, 'index.html'), paginaLoja(slug, loja));
  fs.writeFileSync(path.join(out, 'placa', 'index.html'), paginaPlaca(slug, loja));
  const rel = path.join(CLIENTES, slug, 'relatorio.json');
  if (fs.existsSync(rel)) {
    fs.mkdirSync(path.join(out, 'relatorio'), { recursive: true });
    fs.writeFileSync(path.join(out, 'relatorio', 'index.html'), paginaRelatorio(slug, loja, JSON.parse(fs.readFileSync(rel, 'utf8'))));
  }
  console.log(`OK ${slug}: página, plaquinhas${fs.existsSync(rel) ? ' e relatório' : ''} -> saida/${slug}/`);
}

function novo(slug) {
  if (!/^[a-z0-9-]+$/.test(slug || '')) falha('use só letras minúsculas, números e hífen');
  const dir = path.join(CLIENTES, slug);
  if (fs.existsSync(dir)) falha(`clientes/${slug} já existe`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'loja.json'), JSON.stringify({
    nome: '', ramo: '', cidade: '', uf: 'SP', cor: '#8A3B12',
    placeId: null, linkAvaliacao: null, whatsappSugestao: null, modo: 'previa',
    placa: { titulo: 'Sua opinião conta', texto: 'Aponte a câmera do celular para o código e conte como foi.', quantidade: 2 },
  }, null, 2) + '\n');
  console.log(`Criado clientes/${slug}/loja.json. Preencha nome, cidade, cor e o placeId da loja.`);
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === 'novo') novo(arg);
else if (cmd === 'todos') for (const s of fs.readdirSync(CLIENTES)) { if (fs.existsSync(path.join(CLIENTES, s, 'loja.json'))) gerar(s); }
else if (cmd) gerar(cmd);
else console.log('Uso: node gerar.mjs <slug> | todos | novo <slug>');
