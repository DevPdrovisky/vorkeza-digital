// Gera as imagens do site de vendas a partir do raio-x de exemplo (celular: topo, concorrentes e plano).
// Uso: node ferramentas/imagens-site.cjs   (rode depois de gerar o raio-x)
const path = require('path');
const { createRequire } = require('module');
const { abrir } = require('./capturar.cjs');
const sharp = createRequire('C:/Users/cmraj/Desktop/PrixPablo/site/node_modules/x.js')('sharp');
const RAIZ = path.resolve(__dirname, '..');
const URL = 'file:///' + path.join(RAIZ, '3-Produto', 'saida', 'doceria-modelo', 'index.html').split(path.sep).join('/');
const OUT = path.join(RAIZ, '2-Site', 'assets');
const erros = [];
(async () => {
  const b = await abrir();
  const p = await b.newPage();
  p.on('pageerror', e => erros.push(e.message));
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
  await p.evaluate(async () => { await document.fonts.ready; });
  await new Promise(r => setTimeout(r, 500));
  await sharp(await p.screenshot()).resize({ width: 780 }).webp({ quality: 80 }).toFile(path.join(OUT, 'raio-x-celular.webp'));
  for (const [sel, nome] of [['.rx-bloco:has(.rx-tabela)', 'raio-x-concorrentes.webp'], ['.rx-plano', 'raio-x-plano.webp']]) {
    const y = await p.evaluate(s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().top + scrollY - 16 : null; }, sel);
    if (y == null) { erros.push('não achei ' + sel); continue; }
    const png = await p.screenshot({ clip: { x: 0, y, width: 390, height: 693 }, captureBeyondViewport: true });
    await sharp(png).resize({ width: 720, height: 1280, fit: 'cover', position: 'top' }).webp({ quality: 82 }).toFile(path.join(OUT, nome));
  }
  await b.close();
  console.log('imagens em 2-Site/assets', erros.length ? 'ERROS: ' + erros.join(' | ') : 'sem erros');
})().catch(e => { console.error(e); process.exit(1); });
