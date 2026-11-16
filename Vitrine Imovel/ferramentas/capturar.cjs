// Tira capturas de tela de páginas com o Brave em modo invisível.
// Uso: node capturar.cjs <url> <saida.png> [largura] [altura] [inteira:0|1] [escala]
// Também exporta capturar() para outros scripts.
const path = require('path');
const { createRequire } = require('module');
const req = createRequire(path.join('C:/Users/cmraj/Desktop/Vorkeza Digital/pack-instagram-src', 'x.js'));
const puppeteer = req('puppeteer-core');
const BRAVE = 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe';

async function abrir() {
  return puppeteer.launch({ executablePath: BRAVE, headless: true, args: ['--allow-file-access-from-files', '--hide-scrollbars'] });
}

async function capturar(browser, url, saida, { largura = 390, altura = 844, inteira = false, escala = 2, antes } = {}) {
  const p = await browser.newPage();
  const erros = [];
  p.on('pageerror', e => erros.push(e.message));
  p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  await p.setViewport({ width: largura, height: altura, deviceScaleFactor: escala, isMobile: largura < 700, hasTouch: largura < 700 });
  await p.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await p.evaluate(async () => { await document.fonts.ready; for (const i of document.images) { i.loading = 'eager'; } await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); });
  if (antes) await antes(p);
  await new Promise(r => setTimeout(r, 400));
  await p.screenshot({ path: saida, fullPage: inteira });
  await p.close();
  return erros;
}

module.exports = { abrir, capturar };

if (require.main === module) {
  const [url, saida, l, a, inteira, e] = process.argv.slice(2);
  (async () => {
    const b = await abrir();
    const erros = await capturar(b, url, path.resolve(saida), { largura: +l || 390, altura: +a || 844, inteira: inteira === '1', escala: +e || 1 });
    await b.close();
    console.log('ok', saida, erros.length ? 'ERROS: ' + erros.join(' | ') : 'sem erros');
  })().catch(e => { console.error(e); process.exit(1); });
}
