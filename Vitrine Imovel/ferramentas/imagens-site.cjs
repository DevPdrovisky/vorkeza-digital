// Gera as imagens do site de vendas a partir da demo: print do celular, print de um imóvel e artes (story e VENDIDO).
// Uso: node ferramentas/imagens-site.cjs   (rode depois do montar.mjs)
const path = require('path'), fs = require('fs');
const { createRequire } = require('module');
const { abrir } = require('./capturar.cjs');
const sharp = createRequire('C:/Users/cmraj/Desktop/PrixPablo/site/node_modules/x.js')('sharp');
const RAIZ = path.resolve(__dirname, '..');
const DEMO = path.join(RAIZ, '3-Produto', 'saida', 'lar-modelo-imoveis');
const OUT = path.join(RAIZ, '2-Site', 'assets');
const url = p => 'file:///' + path.join(DEMO, p).split(path.sep).join('/');
const erros = [];
async function print(b, pagina, nome) {
  const p = await b.newPage();
  p.on('pageerror', e => erros.push(nome + ': ' + e.message));
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto(url(pagina), { waitUntil: 'networkidle0', timeout: 90000 });
  await p.evaluate(async () => { await document.fonts.ready; });
  await new Promise(r => setTimeout(r, 600));
  const png = await p.screenshot();
  await sharp(png).resize({ width: 780 }).webp({ quality: 80 }).toFile(path.join(OUT, nome));
  await p.close();
}
async function arte(b, id, tipo, nome) {
  const p = await b.newPage();
  p.on('pageerror', e => erros.push(nome + ': ' + e.message));
  await p.setViewport({ width: 1000, height: 900 });
  await p.goto(url('artes/index.html'), { waitUntil: 'networkidle0', timeout: 90000 });
  await p.click(`[data-arte="${tipo}"][data-id="${id}"]`);
  await p.waitForFunction(() => document.querySelector('#arte-img').src.startsWith('blob:'), { timeout: 60000 });
  const dados = await p.evaluate(() => document.querySelector('#arte-canvas').toDataURL('image/png'));
  await sharp(Buffer.from(dados.split(',')[1], 'base64')).resize({ width: 720 }).webp({ quality: 82 }).toFile(path.join(OUT, nome));
  await p.close();
}
(async () => {
  const b = await abrir();
  await print(b, 'index.html', 'demo-celular.webp');
  const slug = fs.readdirSync(path.join(DEMO, 'imovel')).find(s => s.includes('jardim-primavera'));
  await print(b, `imovel/${slug}/index.html`, 'demo-imovel.webp');
  await arte(b, '206', 'story', 'arte-story.webp');
  await arte(b, '211', 'fim', 'arte-vendido.webp');
  await b.close();
  console.log('imagens em 2-Site/assets', erros.length ? 'ERROS: ' + erros.join(' | ') : 'sem erros');
})().catch(e => { console.error(e); process.exit(1); });
