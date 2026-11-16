// Gráfico de visitas do vorkeza.com.br (Cloudflare) -> PNG em relatorios/
// Uso:
//   node ferramentas/views-pro-pai.js            gera o gráfico com dados reais (30 dias)
//   node ferramentas/views-pro-pai.js --demo     gera com dados de exemplo (teste)
//   node ferramentas/views-pro-pai.js --hook     modo gancho do Claude Code (lê o prompt no stdin)
// Token: variável CLOUDFLARE_API_TOKEN ou arquivo %USERPROFILE%\.vorkeza\cloudflare-token.txt
// (token só de leitura: Account Analytics Read, Zone Analytics Read, Zone Read)
const fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'relatorios');
const ZONE_NAME = 'vorkeza.com.br';
const DAYS = 30;
const BROWSER = 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe';
const TOKEN_FILE = path.join(os.homedir(), '.vorkeza', 'cloudflare-token.txt');
const GATILHO = /views\s*pro\s*pai/i;

const args = process.argv.slice(2);
const HOOK = args.includes('--hook'), DEMO = args.includes('--demo');

function token() {
  if (process.env.CLOUDFLARE_API_TOKEN) return process.env.CLOUDFLARE_API_TOKEN.trim();
  try { return fs.readFileSync(TOKEN_FILE, 'utf8').trim() } catch { return null }
}

async function cf(pathname, body) {
  const r = await fetch('https://api.cloudflare.com/client/v4' + pathname, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: 'Bearer ' + token(), 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.success === false || (j.errors && j.errors.length && !j.data))
    throw new Error(`Cloudflare ${r.status}: ${JSON.stringify(j.errors || j).slice(0, 300)}`);
  return j;
}

const iso = d => d.toISOString().slice(0, 10);
function janela() {
  const fim = new Date(), ini = new Date(fim.getTime() - (DAYS - 1) * 864e5);
  const dias = []; for (let t = ini.getTime(); dias.length < DAYS; t += 864e5) dias.push(iso(new Date(t)));
  return { de: dias[0], ate: dias[dias.length - 1], dias };
}

async function dadosReais() {
  const { de, ate, dias } = janela();
  const z = await cf('/zones?name=' + ZONE_NAME);
  if (!z.result || !z.result.length) throw new Error('Zona ' + ZONE_NAME + ' não encontrada para este token.');
  const zone = z.result[0], conta = zone.account.id;

  // 1) Análise da zona (proxy): conta tudo, inclusive robôs
  const q1 = `query($z:String!,$de:Date!,$ate:Date!){viewer{zones(filter:{zoneTag:$z}){
    httpRequests1dGroups(limit:60,filter:{date_geq:$de,date_leq:$ate},orderBy:[date_ASC]){
      dimensions{date} sum{pageViews requests} uniq{uniques}}}}}`;
  const r1 = await cf('/graphql', { query: q1, variables: { z: zone.id, de, ate } });
  if (r1.errors && r1.errors.length) throw new Error('GraphQL: ' + r1.errors.map(e => e.message).join('; '));
  const zg = (r1.data.viewer.zones[0] || {}).httpRequests1dGroups || [];
  const porDia = Object.fromEntries(zg.map(g => [g.dimensions.date, g]));

  // 2) Web Analytics (pessoas reais), se estiver ligado na conta
  let rum = null;
  try {
    const r2 = await require('./cf-rum').rumPorBlocos(cf, conta, dias);
    if (r2.dias.some(d => d.views)) rum = r2.dias;
  } catch { /* Web Analytics desligado ou sem permissão: segue só com a zona */ }

  if (rum) return {
    fonte: 'Cloudflare Web Analytics (pessoas reais)', dias,
    a: { nome: 'Visitas', v: rum.map(d => d.visits) },
    b: { nome: 'Páginas abertas', v: rum.map(d => d.views) },
  };
  return {
    fonte: 'Cloudflare, análise da zona (inclui robôs e buscadores)', dias,
    a: { nome: 'Visitantes únicos', v: dias.map(d => porDia[d]?.uniq.uniques || 0) },
    b: { nome: 'Páginas vistas', v: dias.map(d => porDia[d]?.sum.pageViews || 0) },
  };
}

function dadosDemo() {
  const { dias } = janela(); let s = 7;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const a = dias.map((d, i) => Math.round(6 + i * .6 + rnd() * 8 + (new Date(d).getUTCDay() % 6 === 0 ? -3 : 0)));
  return { fonte: 'DADOS DE EXEMPLO (teste, não são visitas reais)', dias,
    a: { nome: 'Visitantes únicos', v: a }, b: { nome: 'Páginas vistas', v: a.map(x => Math.round(x * (1.6 + rnd()))) } };
}

const soma = v => v.reduce((p, c) => p + c, 0);
function resumo(D) {
  const A = D.a.v, B = D.b.v, n = A.length;
  const ult7 = soma(A.slice(n - 7)), ant7 = soma(A.slice(n - 14, n - 7));
  const varia = ant7 ? Math.round((ult7 - ant7) / ant7 * 100) : null;
  let pico = 0; A.forEach((x, i) => { if (x > A[pico]) pico = i });
  return { totalA: soma(A), totalB: soma(B), hoje: A[n - 1], ontem: A[n - 2], ult7, ant7, varia, pico: { dia: D.dias[pico], v: A[pico] } };
}

const br = d => d.slice(8, 10) + '/' + d.slice(5, 7);
const num = x => x.toLocaleString('pt-BR');

function html(D, R) {
  const W = 1080, H = 420, padL = 52, padR = 24, padT = 16, padB = 34;
  const A = D.a.v, B = D.b.v, n = A.length;
  const top = Math.max(4, ...A, ...B);
  const passo = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000].find(p => top / p <= 5) || Math.ceil(top / 5);
  const maxY = Math.ceil(top / passo) * passo;
  const x = i => padL + (i + .5) * (W - padL - padR) / n, bw = (W - padL - padR) / n - 4;
  const y = v => padT + (H - padT - padB) * (1 - v / maxY);
  let grid = '';
  for (let v = 0; v <= maxY; v += passo)
    grid += `<line x1="${padL}" x2="${W - padR}" y1="${y(v)}" y2="${y(v)}" class="g"/><text x="${padL - 10}" y="${y(v) + 4}" class="ax" text-anchor="end">${num(v)}</text>`;
  const barras = B.map((v, i) => {
    const h = Math.max(0, y(0) - y(v)), r = Math.min(4, h / 2, bw / 2);
    if (!h) return '';
    const x0 = x(i) - bw / 2, y0 = y(v), x1 = x0 + bw, yb = y(0);
    return `<path d="M${x0},${yb}V${y0 + r}Q${x0},${y0} ${x0 + r},${y0}H${x1 - r}Q${x1},${y0} ${x1},${y0 + r}V${yb}Z" class="bar"/>`;
  }).join('');
  const linha = A.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(v).toFixed(1)).join('');
  const datas = D.dias.map((d, i) => (i % 5 === (n - 1) % 5) ? `<text x="${x(i)}" y="${H - 10}" class="ax" text-anchor="middle">${br(d)}</text>` : '').join('');
  const fim = `<circle cx="${x(n - 1)}" cy="${y(A[n - 1])}" r="5" class="dot"/>`;
  const pi = D.dias.indexOf(R.pico.dia);
  const picoLbl = R.pico.v ? `<circle cx="${x(pi)}" cy="${y(R.pico.v)}" r="5" class="dot"/><text x="${x(pi)}" y="${y(R.pico.v) - 12}" class="lbl" text-anchor="middle">pico ${num(R.pico.v)}</text>` : '';
  const seta = R.varia == null ? '—' : (R.varia >= 0 ? '▲ ' : '▼ ') + Math.abs(R.varia) + '%';
  const demo = D.fonte.startsWith('DADOS DE EXEMPLO');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  :root{--ink:#22163a;--muted:#6b5d82;--line:#ece3f3;--bg:#faf6fd;--card:#fff;--a:#7e22ce;--b:#e05bc0}
  *{box-sizing:border-box;margin:0}body{width:1200px;background:var(--bg);font-family:"Segoe UI",system-ui,sans-serif;color:var(--ink);padding:36px 44px}
  header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:22px}
  h1{font-size:30px;letter-spacing:-.03em;font-weight:800}h1 span{color:var(--a)}
  .sub{color:var(--muted);font-size:15px;margin-top:4px}
  .tag{font-size:13px;font-weight:700;padding:6px 12px;border-radius:99px;background:${demo ? '#fde7f6;color:#9d1a7a' : '#f3e8ff;color:#6b21a8'}}
  .tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px}
  .t{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px}
  .t b{display:block;font-size:34px;letter-spacing:-.03em;font-weight:800;line-height:1.1}
  .t small{color:var(--muted);font-size:14px}
  .chart{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px 8px}
  .leg{display:flex;gap:22px;font-size:14px;color:var(--muted);margin:0 0 6px 4px}
  .leg i{display:inline-block;width:14px;height:14px;border-radius:4px;vertical-align:-2px;margin-right:7px}
  .leg .la{height:3px;border-radius:2px;vertical-align:4px;width:18px}
  svg text{font-family:inherit}.ax{fill:#988aa8;font-size:12px}.g{stroke:var(--line);stroke-width:1}
  .bar{fill:var(--b);opacity:.45}.halo{fill:none;stroke:#fff;stroke-width:7;stroke-linejoin:round;stroke-linecap:round}.ln{fill:none;stroke:var(--a);stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round}
  .dot{fill:var(--a);stroke:#fff;stroke-width:2}.lbl{fill:var(--ink);font-size:13px;font-weight:700}
  footer{color:var(--muted);font-size:13px;margin-top:12px}
  </style></head><body>
  <header><div><h1>Views pro pai <span>·</span> vorkeza.com.br</h1>
  <div class="sub">Últimos ${n} dias · ${br(D.dias[0])} a ${br(D.dias[n - 1])}</div></div>
  <div class="tag">${demo ? 'DADOS DE EXEMPLO' : 'Atualizado ' + new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</div></header>
  <div class="tiles">
   <div class="t"><b>${num(R.totalA)}</b><small>${D.a.nome.toLowerCase()} em ${n} dias</small></div>
   <div class="t"><b>${num(R.totalB)}</b><small>${D.b.nome.toLowerCase()} em ${n} dias</small></div>
   <div class="t"><b>${num(R.ult7)}</b><small>últimos 7 dias · ${seta} vs 7 antes</small></div>
   <div class="t"><b>${num(R.hoje)}</b><small>hoje (UTC) · ontem ${num(R.ontem)}</small></div>
  </div>
  <div class="chart"><div class="leg"><span><i class="la" style="background:var(--a)"></i>${D.a.nome}</span><span><i style="background:var(--b);opacity:.45"></i>${D.b.nome}</span></div>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${grid}${barras}<path d="${linha}" class="halo"/><path d="${linha}" class="ln"/>${picoLbl}${fim}${datas}</svg></div>
  <footer>Fonte: ${D.fonte}. Dias em UTC.</footer></body></html>`;
}

async function gerar() {
  const D = DEMO ? dadosDemo() : await dadosReais();
  const R = resumo(D);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const png = path.join(OUT_DIR, `views-${DEMO ? 'exemplo-' : ''}${stamp}.png`);
  const htmlFile = path.join(os.tmpdir(), 'views-pro-pai.html');
  fs.writeFileSync(htmlFile, html(D, R));
  const puppeteer = require(path.join(ROOT, 'pack-instagram-src', 'node_modules', 'puppeteer-core'));
  const b = await puppeteer.launch({ executablePath: BROWSER, headless: true });
  try {
    const p = await b.newPage();
    await p.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });
    await p.goto('file:///' + htmlFile.replace(/\\/g, '/'));
    const h = await p.evaluate(() => document.body.scrollHeight);
    await p.setViewport({ width: 1200, height: h, deviceScaleFactor: 2 });
    await p.screenshot({ path: png, fullPage: true });
  } finally { await b.close() }
  const texto = `${D.a.nome} em ${D.dias.length} dias: ${num(R.totalA)} · ${D.b.nome}: ${num(R.totalB)} · últimos 7 dias: ${num(R.ult7)}` +
    (R.varia == null ? '' : ` (${R.varia >= 0 ? '+' : ''}${R.varia}% vs 7 dias antes)`) +
    ` · hoje: ${num(R.hoje)} · ontem: ${num(R.ontem)} · pico: ${num(R.pico.v)} em ${br(R.pico.dia)} · fonte: ${D.fonte}`;
  return { png, texto };
}

const SEM_TOKEN = `O token da Cloudflare ainda não foi configurado, então não há como buscar as visitas.
Passos para o usuário (ele mesmo, nunca colar o token no chat):
1. dash.cloudflare.com/profile/api-tokens > Create Token > Custom token.
2. Permissões: Account | Account Analytics | Read; Zone | Analytics | Read; Zone | Zone | Read. Zona: vorkeza.com.br.
3. Salvar no PC (o script pede o token, confere com a Cloudflare e salva):
powershell -ExecutionPolicy Bypass -File "${path.join(ROOT, 'ferramentas', 'salvar-token.ps1')}"`;

async function main() {
  if (HOOK) {
    let entrada = ''; for await (const c of process.stdin) entrada += c;
    let prompt = ''; try { prompt = JSON.parse(entrada).prompt || '' } catch { }
    if (!GATILHO.test(prompt)) return;            // não é o gatilho: não faz nada
    let ctx;
    if (!token()) ctx = '[views pro pai] ' + SEM_TOKEN;
    else try {
      const { png, texto } = await gerar();
      ctx = `[views pro pai] Gráfico de visitas gerado agora: ${png}\nResumo: ${texto}\nEnvie o PNG ao usuário com SendUserFile (display render) e comente os números em poucas linhas, em português.`;
    } catch (e) { ctx = `[views pro pai] Falhou ao buscar as visitas: ${e.message}` }
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: ctx } }));
    return;
  }
  if (!DEMO && !token()) { console.log(SEM_TOKEN); process.exitCode = 2; return }
  const { png, texto } = await gerar();
  console.log(png); console.log(texto);
}
main().catch(e => { console.error(e.message); process.exitCode = 1 });
