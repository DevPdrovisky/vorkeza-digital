// Renderiza um SVG/HTML de logo em PNG de alta resolução.
// Uso: node render-logo.js <arquivo.html> <saida.png> <largura-final-px>
const puppeteer = require('puppeteer-core'), path = require('path'), url = require('url');
const [arq, saida, largura] = process.argv.slice(2);
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true });
  const p = await b.newPage();
  await p.setViewport({ width: 1200, height: 700, deviceScaleFactor: 1 });
  await p.goto(url.pathToFileURL(path.resolve(arq)).href, { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  const box = await p.evaluate(() => { const r = document.querySelector('svg').getBoundingClientRect(); return { w: r.width, h: r.height }; });
  const escala = Number(largura) / box.w;
  await p.setViewport({ width: Math.ceil(box.w), height: Math.ceil(box.h), deviceScaleFactor: escala });
  await p.evaluate(() => document.fonts.ready);
  const el = await p.$('svg');
  await el.screenshot({ path: path.resolve(saida), omitBackground: true });
  console.log(path.resolve(saida), Math.round(box.w * escala) + 'x' + Math.round(box.h * escala));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
