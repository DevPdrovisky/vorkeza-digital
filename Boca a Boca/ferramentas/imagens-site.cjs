// Gera as imagens do site de vendas a partir da loja de exemplo: página da loja, plaquinha, adesivo e relatório.
// Uso: node ferramentas/imagens-site.cjs   (rode depois de gerar.mjs e placas.cjs)
const path = require('path');
const { createRequire } = require('module');
const { abrir } = require('./capturar.cjs');
const sharp = createRequire('C:/Users/cmraj/Desktop/PrixPablo/site/node_modules/x.js')('sharp');
const RAIZ = path.resolve(__dirname, '..');
const DEMO = path.join(RAIZ, '3-Produto', 'saida', 'padaria-modelo');
const OUT = path.join(RAIZ, '2-Site', 'assets');
const url = p => 'file:///' + path.join(DEMO, p).split(path.sep).join('/');
const erros = [];
async function print(b, pagina, nome, altura = 844) {
  const p = await b.newPage();
  p.on('pageerror', e => erros.push(nome + ': ' + e.message));
  await p.setViewport({ width: 390, height: altura, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto(url(pagina), { waitUntil: 'networkidle0', timeout: 60000 });
  await p.evaluate(async () => { await document.fonts.ready; });
  await new Promise(r => setTimeout(r, 400));
  await sharp(await p.screenshot()).resize({ width: 780 }).webp({ quality: 80 }).toFile(path.join(OUT, nome));
  await p.close();
}
(async () => {
  const b = await abrir();
  await print(b, 'index.html', 'loja-celular.webp');
  await print(b, 'relatorio/index.html', 'relatorio.webp', 693);
  await b.close();
  await sharp(path.join(DEMO, 'placa', 'placa.png')).resize({ width: 720 }).webp({ quality: 85 }).toFile(path.join(OUT, 'placa.webp'));
  await sharp(path.join(DEMO, 'placa', 'adesivo.png')).resize({ width: 720 }).webp({ quality: 85 }).toFile(path.join(OUT, 'adesivo.webp'));
  console.log('imagens em 2-Site/assets', erros.length ? 'ERROS: ' + erros.join(' | ') : 'sem erros');
})().catch(e => { console.error(e); process.exit(1); });
