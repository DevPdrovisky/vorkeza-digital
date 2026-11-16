#!/usr/bin/env node
// Bem no Mapa — gera o "raio-x" (diagnóstico grátis) de um negócio a partir de clientes/<slug>/raio-x.json.
//
//   node gerar-raio-x.mjs <slug>        gera saida/<slug>/index.html
//   node gerar-raio-x.mjs todos
//   node gerar-raio-x.mjs novo <slug>   cria o raio-x.json para preencher
//
// Preencha só com o que você VIU no perfil público do negócio no Google Maps, na data do diagnóstico.
// O que não deu para ver fica null e aparece como "A confirmar". Nunca invente número.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { creditoHtml, marca as marcaGrupo } from '../../grupo/grupo-node.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CLIENTES = path.join(ROOT, 'clientes'), SAIDA = path.join(ROOT, 'saida'), MODELO = path.join(ROOT, 'modelo');
const MARCA = JSON.parse(fs.readFileSync(path.join(ROOT, '..', 'marca.json'), 'utf8'));
const G = marcaGrupo('bemnomapa'); MARCA.url = G.url; MARCA.nome = G.nome;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tem = v => v !== null && v !== undefined && v !== '';
const AC = 'A confirmar';
const wa = (num, msg) => `https://wa.me/${String(num).replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
const dataBR = d => d ? d.split('-').reverse().join('/') : '';
const nota = n => tem(n) ? n.toFixed(1).replace('.', ',') : AC;
const pct = n => tem(n) ? Math.round(n * 100) + '%' : AC;
const dias = d => Math.round((new Date() - new Date(d)) / 864e5);
const falha = m => { console.error('ERRO: ' + m); process.exit(1); };

const sv = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
const IC = { ok: sv('m5 12.5 4.5 4.5L19 7.5'), atencao: sv('M12 8v5M12 16.5v.01M10.3 3.9 2.6 17.3A2 2 0 0 0 4.3 20.3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z'), falta: sv('M6 6l12 12M18 6 6 18'), indef: sv('M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01') };
const ROT = { ok: 'Em dia', atencao: 'Pode melhorar', falta: 'Falta', indef: 'A confirmar' };

function itens(p, conc) {
  const mediaConc = conc.length ? conc.reduce((a, c) => a + (c.avaliacoes || 0), 0) / conc.length : null;
  const L = [];
  const add = (id, titulo, peso, status, valor, porque) => L.push({ id, titulo, peso, status, valor, porque });
  add('nota', 'Nota média', 3, !tem(p.nota) ? 'indef' : p.nota >= 4.5 ? 'ok' : p.nota >= 4 ? 'atencao' : 'falta', tem(p.nota) ? `${nota(p.nota)} de 5` : AC,
    'Quem compara dois negócios no mapa costuma olhar a nota primeiro. Ela sobe com mais avaliações de clientes reais e respostas educadas às críticas.');
  add('avaliacoes', 'Quantidade de avaliações', 3, !tem(p.avaliacoes) ? 'indef' : mediaConc === null ? (p.avaliacoes >= 50 ? 'ok' : 'atencao') : p.avaliacoes >= mediaConc ? 'ok' : p.avaliacoes >= mediaConc / 2 ? 'atencao' : 'falta',
    tem(p.avaliacoes) ? `${p.avaliacoes}${mediaConc !== null ? ` (média dos concorrentes: ${Math.round(mediaConc)})` : ''}` : AC,
    'Muitas avaliações recentes passam confiança. A forma certa de ter mais é pedir para todo cliente, sem escolher só os satisfeitos.');
  add('respostas', 'Respostas às avaliações', 2, !tem(p.respondidas) ? 'indef' : p.respondidas >= .8 ? 'ok' : p.respondidas >= .3 ? 'atencao' : 'falta', pct(p.respondidas) + (tem(p.respondidas) ? ' respondidas' : ''),
    'Responder mostra que tem alguém cuidando. Uma resposta calma a uma crítica vale mais para quem lê do que a própria crítica.');
  add('fotos', 'Fotos', 2, !tem(p.fotos) ? 'indef' : p.fotos >= 20 && (p.fotosRecentes ?? 1) > 0 ? 'ok' : p.fotos >= 8 ? 'atencao' : 'falta',
    tem(p.fotos) ? `${p.fotos} fotos${tem(p.fotosRecentes) ? `, ${p.fotosRecentes} nos últimos 3 meses` : ''}` : AC,
    'Fachada, ambiente, produtos e equipe. Foto boa e atual responde a pergunta "é aqui mesmo?" antes de o cliente sair de casa.');
  const up = p.ultimaPostagem;
  add('postagens', 'Postagens no perfil', 2, !tem(up) ? 'indef' : up === 'nenhuma' ? 'falta' : dias(up) <= 30 ? 'ok' : dias(up) <= 90 ? 'atencao' : 'falta',
    !tem(up) ? AC : up === 'nenhuma' ? 'Nenhuma encontrada' : `Última em ${dataBR(up)}`,
    'Novidades e ofertas aparecem direto no perfil. Mostram que o negócio está ativo.');
  add('horario', 'Horário de funcionamento', 2, !tem(p.horario) ? 'indef' : p.horario && p.horarioFeriados ? 'ok' : p.horario ? 'atencao' : 'falta',
    !tem(p.horario) ? AC : p.horario ? (p.horarioFeriados ? 'Completo, com feriados' : 'Sem horário de feriados') : 'Não informado',
    'Horário errado é a reclamação mais irritante que existe: o cliente vai até a porta e encontra fechado.');
  add('contato', 'Telefone e WhatsApp', 2, !tem(p.telefone) ? 'indef' : p.telefone && p.linkWhatsapp ? 'ok' : p.telefone ? 'atencao' : 'falta',
    !tem(p.telefone) ? AC : [p.telefone ? 'Telefone ok' : 'Sem telefone', p.linkWhatsapp ? 'WhatsApp ok' : 'sem link de WhatsApp'].join(', '),
    'Um toque para ligar ou chamar no WhatsApp direto do mapa.');
  add('site', 'Site ou link', 1, !tem(p.site) ? 'indef' : p.site ? 'ok' : 'falta', !tem(p.site) ? AC : p.site ? 'Tem' : 'Sem link',
    'Um link para cardápio, catálogo ou site completa o que o perfil não mostra.');
  add('descricao', 'Descrição do negócio', 1, !tem(p.descricao) ? 'indef' : p.descricao ? 'ok' : 'falta', !tem(p.descricao) ? AC : p.descricao ? 'Tem' : 'Em branco',
    'Duas ou três frases sobre o que você faz, para quem e onde.');
  add('categorias', 'Categorias', 1, !tem(p.categoriasExtras) ? 'indef' : p.categoriasExtras >= 1 ? 'ok' : 'atencao',
    tem(p.categoriaPrincipal) ? `${p.categoriaPrincipal}${tem(p.categoriasExtras) ? ` + ${p.categoriasExtras} extra${p.categoriasExtras === 1 ? '' : 's'}` : ''}` : AC,
    'A categoria certa ajuda o Google a mostrar você para a busca certa ("bolo de aniversário", "doces para festa").');
  add('produtos', 'Produtos ou serviços', 1, !tem(p.produtosOuServicos) ? 'indef' : p.produtosOuServicos ? 'ok' : 'falta', !tem(p.produtosOuServicos) ? AC : p.produtosOuServicos ? 'Cadastrados' : 'Nenhum cadastrado',
    'Uma vitrine dentro do perfil, com foto e preço quando fizer sentido.');
  return L;
}

function pagina(slug, d) {
  const { negocio: n, perfil: p, concorrentes: conc = [] } = d;
  const L = itens(p, conc);
  const conhecidos = L.filter(i => i.status !== 'indef');
  const valor = { ok: 1, atencao: .5, falta: 0 };
  const score = conhecidos.length ? Math.round(conhecidos.reduce((a, i) => a + i.peso * valor[i.status], 0) / conhecidos.reduce((a, i) => a + i.peso, 0) * 100) : null;
  const faixa = score === null ? 'indef' : score >= 80 ? 'ok' : score >= 50 ? 'atencao' : 'falta';
  const prioridades = L.filter(i => i.status === 'falta' || i.status === 'atencao').sort((a, b) => b.peso - a.peso || (a.status === 'falta' ? -1 : 1)).slice(0, 5);
  const todos = [{ nome: n.nome, nota: p.nota, avaliacoes: p.avaliacoes, fotos: p.fotos, voce: true }, ...conc];
  const maxAv = Math.max(1, ...todos.map(t => t.avaliacoes || 0));
  const msg = `Olá! Vi o raio-x do perfil da ${n.nome} no Google e quero conversar sobre as melhorias.`;
  const demo = n.modo === 'demo';
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Raio-x do perfil no Google — ${esc(n.nome)}</title>
<meta name="description" content="Diagnóstico de como ${esc(n.nome)} aparece hoje na busca e no mapa, comparado aos concorrentes.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#1A0B0C">
<link rel="preload" href="assets/fontes/manrope.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/raio-x.css">
<link rel="icon" href="assets/icone.svg" type="image/svg+xml">
</head>
<body>
${demo ? `<div class="faixa-modo">Negócio fictício para demonstração. <a href="${esc(MARCA.url)}">Quer o raio-x do seu negócio? Conheça o ${esc(MARCA.nome)}</a></div>` : `<div class="faixa-modo">Diagnóstico grátis feito pelo ${esc(MARCA.nome)} para ${esc(n.nome)}, com dados públicos vistos em ${dataBR(n.data)}.</div>`}
<header class="rx-topo">
  <div class="wrap">
    <p class="rx-kicker">Raio-x do perfil no Google</p>
    <h1>${esc(n.nome)}</h1>
    <p class="rx-sub">${esc(n.categoria || '')}${n.categoria ? ' · ' : ''}${esc(n.cidade)} — ${esc(n.uf)} · diagnóstico de ${dataBR(n.data)}</p>
  </div>
</header>
<main class="wrap rx">
  <section class="rx-resumo">
    <div class="rx-score rx-${faixa}">
      <p class="rx-score-rot">Nota do perfil</p>
      <p class="rx-score-num"><strong>${score ?? '—'}</strong><span>/100</span></p>
      <div class="rx-medidor" role="img" aria-label="Nota do perfil: ${score ?? 'a confirmar'} de 100"><span style="width:${score ?? 0}%"></span></div>
      <p class="rx-score-txt">${score === null ? 'Faltam dados para calcular.' : score >= 80 ? 'Perfil bem cuidado. Dá para ganhar nos detalhes.' : score >= 50 ? 'Perfil no meio do caminho. Há ganhos rápidos aqui.' : 'Perfil abandonado. Quem procura acha, mas não escolhe.'}</p>
    </div>
    <div class="rx-hoje">
      <h2>Como aparece hoje</h2>
      <dl class="rx-dados">
        <div><dt>Nota</dt><dd>${tem(p.nota) ? `<b class="estrela" aria-hidden="true">★</b> ${nota(p.nota)}` : AC}</dd></div>
        <div><dt>Avaliações</dt><dd>${tem(p.avaliacoes) ? p.avaliacoes : AC}</dd></div>
        <div><dt>Respondidas</dt><dd>${pct(p.respondidas)}</dd></div>
        <div><dt>Fotos</dt><dd>${tem(p.fotos) ? p.fotos : AC}</dd></div>
      </dl>
    </div>
  </section>

  <section class="rx-bloco">
    <h2>Item por item</h2>
    <ul class="rx-lista">
      ${L.map(i => `<li class="rx-item rx-${i.status}">
        <span class="rx-ico">${IC[i.status]}</span>
        <div><h3>${esc(i.titulo)} <span class="rx-tag">${ROT[i.status]}</span></h3><p class="rx-valor">${esc(i.valor)}</p><p class="rx-porque">${esc(i.porque)}</p></div>
      </li>`).join('')}
    </ul>
  </section>

  ${conc.length ? `<section class="rx-bloco">
    <h2>Você e os concorrentes</h2>
    <p class="rx-nota-tab">Negócios da mesma categoria que aparecem perto, na mesma busca. ${demo ? 'Nomes e números fictícios.' : `Dados públicos vistos em ${dataBR(n.data)}.`}</p>
    <div class="rx-tabela-box">
    <table class="rx-tabela">
      <thead><tr><th scope="col">Negócio</th><th scope="col">Nota</th><th scope="col">Avaliações</th><th scope="col">Fotos</th></tr></thead>
      <tbody>${todos.map(t => `<tr${t.voce ? ' class="rx-voce"' : ''}><th scope="row">${esc(t.nome)}${t.voce ? ' <span class="rx-tag">você</span>' : ''}</th><td>${tem(t.nota) ? '★ ' + nota(t.nota) : AC}</td><td><span class="rx-barra"><span style="width:${Math.round((t.avaliacoes || 0) / maxAv * 100)}%"></span></span><b>${tem(t.avaliacoes) ? t.avaliacoes : AC}</b></td><td>${tem(t.fotos) ? t.fotos : AC}</td></tr>`).join('')}</tbody>
    </table>
    </div>
  </section>` : ''}

  ${prioridades.length ? `<section class="rx-bloco rx-plano">
    <h2>O que fazemos no primeiro mês</h2>
    <ol>${prioridades.map(i => `<li><b>${esc(i.titulo)}.</b> ${esc(acao(i.id))}</li>`).join('')}</ol>
    <p class="rx-sem-promessa">Ninguém controla a posição no Google. O que dá para fazer é deixar o perfil completo, atualizado e bem avaliado por clientes reais, que é o que o próprio Google recomenda.</p>
  </section>` : ''}

  <section class="rx-cta">
    <div>
      <h2>Quer que a gente cuide disso?</h2>
      <p>Implantação de R$ 297 e R$ 79 por mês, com relatório mensal pelo WhatsApp. Sem fidelidade.</p>
    </div>
    <a class="rx-btn" href="${esc(wa(MARCA.whatsapp, (demo ? '[Teste na demonstração] ' : '') + msg))}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Z"/></svg><span>Conversar no WhatsApp</span></a>
  </section>
  <p class="rx-fonte">${esc(n.fonte || '')}</p>
</main>
<footer class="rx-rodape">
  <div class="wrap">
    <p>${creditoHtml('bemnomapa', 'Diagnóstico feito pelo')}</p>
    <p class="rx-indep">Serviço independente, sem vínculo com o Google. Google é marca registrada da Google LLC.</p>
  </div>
</footer>
</body>
</html>`;
}

function acao(id) {
  return {
    nota: 'Respondemos todas as avaliações e criamos o hábito de pedir avaliação para todo cliente, com link direto.',
    avaliacoes: 'Link e QR code para pedir avaliação a todo cliente (sem escolher só os satisfeitos e sem dar brinde em troca, que o Google proíbe).',
    respostas: 'Respondemos as avaliações em aberto e as novas toda semana, com o seu tom.',
    fotos: 'Fazemos a lista de fotos que faltam (fachada, ambiente, produtos) e publicamos as que você mandar.',
    postagens: 'Uma postagem por semana com novidade, oferta ou bastidor.',
    horario: 'Conferimos o horário e cadastramos os feriados com antecedência.',
    contato: 'Colocamos o link do WhatsApp e conferimos o telefone.',
    site: 'Colocamos o link do seu site, cardápio ou catálogo.',
    descricao: 'Escrevemos a descrição do negócio para você aprovar.',
    categorias: 'Revisamos a categoria principal e incluímos as extras que fazem sentido.',
    produtos: 'Cadastramos os principais produtos ou serviços com foto.',
  }[id];
}

function gerar(slug) {
  const arq = path.join(CLIENTES, slug, 'raio-x.json');
  if (!fs.existsSync(arq)) falha(`clientes/${slug}/raio-x.json não existe`);
  const d = JSON.parse(fs.readFileSync(arq, 'utf8'));
  if (!d.negocio?.nome || !d.negocio?.cidade) falha('raio-x.json sem negocio.nome ou negocio.cidade');
  const out = path.join(SAIDA, slug);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, 'assets', 'fontes'), { recursive: true });
  fs.copyFileSync(path.join(MODELO, 'raio-x.css'), path.join(out, 'assets', 'raio-x.css'));
  for (const f of fs.readdirSync(path.join(ROOT, '..', '..', 'grupo', 'fontes'))) fs.copyFileSync(path.join(ROOT, '..', '..', 'grupo', 'fontes', f), path.join(out, 'assets', 'fontes', f));
  fs.copyFileSync(path.join(ROOT, '..', '2-Site', 'assets', 'logo.svg'), path.join(out, 'assets', 'icone.svg'));
  fs.writeFileSync(path.join(out, 'index.html'), pagina(slug, d));
  console.log(`OK ${slug}: raio-x -> saida/${slug}/`);
}

function novo(slug) {
  if (!/^[a-z0-9-]+$/.test(slug || '')) falha('use só letras minúsculas, números e hífen');
  const dir = path.join(CLIENTES, slug);
  if (fs.existsSync(dir)) falha(`clientes/${slug} já existe`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'raio-x.json'), JSON.stringify({
    negocio: { nome: '', categoria: '', cidade: '', uf: 'SP', data: new Date().toISOString().slice(0, 10), fonte: 'Dados públicos do perfil no Google Maps, vistos na data do diagnóstico.', modo: 'previa' },
    perfil: { nota: null, avaliacoes: null, respondidas: null, fotos: null, fotosRecentes: null, ultimaPostagem: null, horario: null, horarioFeriados: null, telefone: null, site: null, linkWhatsapp: null, descricao: null, categoriaPrincipal: null, categoriasExtras: null, produtosOuServicos: null, endereco: null },
    concorrentes: [{ nome: '', nota: null, avaliacoes: null, fotos: null }],
  }, null, 2) + '\n');
  console.log(`Criado clientes/${slug}/raio-x.json. Preencha só com o que viu no perfil público (o resto fica null = "A confirmar").`);
}

const [cmd, arg] = process.argv.slice(2);
if (!cmd) falha('uso: node gerar-raio-x.mjs <slug> | todos | novo <slug>');
else if (cmd === 'novo') novo(arg);
else if (cmd === 'todos') { for (const s of fs.readdirSync(CLIENTES)) if (fs.existsSync(path.join(CLIENTES, s, 'raio-x.json'))) gerar(s); }
else gerar(cmd);
