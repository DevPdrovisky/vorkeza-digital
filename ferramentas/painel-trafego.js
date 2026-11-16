// Painel de tráfego do vorkeza.com.br -> relatorios/painel-trafego.html
// Uso:
//   node ferramentas/painel-trafego.js           dados reais da Cloudflare (60 dias: 30 + 30 para comparar)
//   node ferramentas/painel-trafego.js --demo    dados de exemplo, só para ver o visual
//   ... --abrir                                   abre o painel no navegador ao terminar
// Token: CLOUDFLARE_API_TOKEN ou %USERPROFILE%\.vorkeza\cloudflare-token.txt
// Permissões do token: Zone | Zone | Read, Zone | Analytics | Read, Account | Account Analytics | Read
const fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'relatorios', 'painel-trafego.html');
const TEMPLATE = path.join(__dirname, 'painel-template.html');
const ZONE_NAME = 'vorkeza.com.br', DIAS = 60;
const args = process.argv.slice(2), DEMO = args.includes('--demo'), ABRIR = args.includes('--abrir');

function token() {
  if (process.env.CLOUDFLARE_API_TOKEN) return process.env.CLOUDFLARE_API_TOKEN.trim();
  try { return fs.readFileSync(path.join(os.homedir(), '.vorkeza', 'cloudflare-token.txt'), 'utf8').trim() } catch { return null }
}
async function cf(p, body) {
  const r = await fetch('https://api.cloudflare.com/client/v4' + p, {
    method: body ? 'POST' : 'GET', body: body ? JSON.stringify(body) : undefined,
    headers: { Authorization: 'Bearer ' + token(), 'Content-Type': 'application/json' },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.success === false) throw new Error(`Cloudflare ${r.status}: ${JSON.stringify(j.errors || j).slice(0, 300)}`);
  if (j.errors && j.errors.length) throw new Error(j.errors.map(e => e.message).join('; '));
  return j;
}
const iso = d => d.toISOString().slice(0, 10);
function janela(n) {
  const hoje = new Date(), dias = [];
  for (let i = n - 1; i >= 0; i--) dias.push(iso(new Date(hoje.getTime() - i * 864e5)));
  return dias;
}

async function reais() {
  const dias = janela(DIAS), de = dias[0], ate = dias[dias.length - 1], de30 = dias[DIAS - 30];
  const z = await cf('/zones?name=' + ZONE_NAME);
  if (!z.result?.length) throw new Error('A zona ' + ZONE_NAME + ' não aparece para este token (falta Zone | Zone | Read?).');
  const zone = z.result[0];
  const q = `query($z:String!,$de:Date!,$ate:Date!){viewer{zones(filter:{zoneTag:$z}){
    httpRequests1dGroups(limit:100,filter:{date_geq:$de,date_leq:$ate},orderBy:[date_ASC]){
      dimensions{date} uniq{uniques}
      sum{requests pageViews bytes cachedBytes cachedRequests threats
        countryMap{clientCountryName requests threats}
        browserMap{uaBrowserFamily pageViews}
        responseStatusMap{edgeResponseStatus requests}
        contentTypeMap{edgeResponseContentTypeName requests bytes}}}}}}`;
  let r;
  try { r = await cf('/graphql', { query: q, variables: { z: zone.id, de, ate } }); }
  catch (e) {
    if (/permission|authz|not authorized/i.test(e.message))
      throw new Error('O token não tem a permissão "Zone | Analytics | Read". Adicione em dash.cloudflare.com/profile/api-tokens > Edit no token.');
    throw e;
  }
  const g = Object.fromEntries((r.data.viewer.zones[0]?.httpRequests1dGroups || []).map(x => [x.dimensions.date, x]));
  const out = dias.map(date => {
    const x = g[date], s = x?.sum || {};
    return {
      date, uniques: x?.uniq.uniques || 0, pageViews: s.pageViews || 0, requests: s.requests || 0, bytes: s.bytes || 0,
      cachedBytes: s.cachedBytes || 0, cachedRequests: s.cachedRequests || 0, threats: s.threats || 0,
      paises: Object.fromEntries((s.countryMap || []).map(c => [c.clientCountryName, { r: c.requests, t: c.threats }])),
      navegadores: Object.fromEntries((s.browserMap || []).filter(b => b.pageViews).map(b => [b.uaBrowserFamily || 'Outro', b.pageViews])),
      status: Object.fromEntries((s.responseStatusMap || []).map(c => [c.edgeResponseStatus, c.requests])),
      tipos: Object.fromEntries((s.contentTypeMap || []).map(c => [c.edgeResponseContentTypeName || 'outro', { r: c.requests, b: c.bytes }])),
    };
  });

  // Web Analytics (pessoas reais): só se estiver ligado e o token puder ler
  let rum = null;
  try {
    const r2 = await require('./cf-rum').rumPorBlocos(cf, zone.account.id, dias,
      { paginas: 'requestPath', origens: 'refererHost', aparelhos: 'deviceType' }, dias.slice(-30));
    if (r2.dias.some(d => d.views)) rum = r2;
  } catch (e) { if (process.env.DEBUG) console.error('Web Analytics:', e.message); }

  return { demo: false, site: ZONE_NAME, atualizado: new Date().toISOString(), dias: out, rum,
    fonte: rum ? 'Cloudflare Web Analytics + análise da zona' : 'Cloudflare, análise da zona' };
}

function demo() {
  let s = 11; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const dias = janela(DIAS);
  const out = dias.map((date, i) => {
    const fds = [0, 6].includes(new Date(date + 'T12:00Z').getUTCDay());
    const base = 8 + i * .35 + rnd() * 9 - (fds ? 4 : 0);
    const uniques = Math.max(2, Math.round(base)), pageViews = Math.round(uniques * (1.7 + rnd() * .8));
    const requests = Math.round(pageViews * (7 + rnd() * 4)), cachedRequests = Math.round(requests * (.62 + rnd() * .2));
    const bytes = requests * Math.round(38000 + rnd() * 20000), cachedBytes = Math.round(bytes * (.7 + rnd() * .15));
    const br = Math.round(requests * .78), us = Math.round(requests * .13);
    return {
      date, uniques, pageViews, requests, bytes, cachedBytes, cachedRequests, threats: rnd() < .2 ? Math.round(rnd() * 6) : 0,
      paises: { BR: { r: br, t: 0 }, US: { r: us, t: 1 }, PT: { r: Math.round(requests * .03), t: 0 }, DE: { r: Math.round(requests * .03), t: 0 }, IE: { r: requests - br - us - Math.round(requests * .06), t: 0 } },
      navegadores: { Chrome: Math.round(pageViews * .52), 'Mobile Safari': Math.round(pageViews * .22), Instagram: Math.round(pageViews * .12), Edge: Math.round(pageViews * .07), Samsung: Math.round(pageViews * .05) },
      status: { 200: Math.round(requests * .9), 304: Math.round(requests * .07), 404: Math.round(requests * .025), 500: rnd() < .1 ? 1 : 0 },
      tipos: { html: { r: pageViews, b: pageViews * 30000 }, js: { r: Math.round(requests * .2), b: 0 }, css: { r: Math.round(requests * .1), b: 0 }, jpeg: { r: Math.round(requests * .3), b: 0 }, png: { r: Math.round(requests * .15), b: 0 } },
    };
  });
  const rumDias = out.map(d => { const visits = Math.max(1, Math.round(d.uniques * (.55 + rnd() * .15))); return { date: d.date, visits, views: Math.round(visits * (1.5 + rnd() * .6)) }; });
  const v30 = rumDias.slice(-30).reduce((a, d) => a + d.visits, 0);
  const parte = (f) => Math.round(v30 * f);
  return {
    demo: true, site: ZONE_NAME, atualizado: new Date().toISOString(), dias: out,
    fonte: 'DADOS DE EXEMPLO (não são visitas reais)',
    rum: {
      dias: rumDias,
      origens: [['instagram.com', .38], ['', .27], ['google.com', .17], ['l.facebook.com', .07], ['wa.me', .05], ['bing.com', .02]].map(([k, f]) => ({ k, visits: parte(f), views: parte(f * 1.8) })),
      paginas: [['/', .66], ['/demo-painel/', .24], ['/index.html', .06]].map(([k, f]) => ({ k, visits: parte(f), views: parte(f * 1.9) })),
      aparelhos: [['mobile', .71], ['desktop', .26], ['tablet', .03]].map(([k, f]) => ({ k, visits: parte(f), views: parte(f * 1.8) })),
    },
  };
}

async function main() {
  if (!DEMO && !token()) { console.error('Falta o token da Cloudflare. Rode: powershell -ExecutionPolicy Bypass -File ferramentas\\salvar-token.ps1'); process.exitCode = 2; return; }
  const dados = DEMO ? demo() : await reais();
  const json = JSON.stringify(dados).replace(/</g, '\\u003c');
  const html = fs.readFileSync(TEMPLATE, 'utf8').replace('/*__DATA__*/null', () => json);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, html);
  console.log(OUT);
  if (ABRIR) require('child_process').spawn('cmd', ['/c', 'start', '', OUT], { detached: true, stdio: 'ignore' }).unref();
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
