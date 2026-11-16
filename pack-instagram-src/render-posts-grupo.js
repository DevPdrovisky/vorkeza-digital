// Renderiza os 5 posts de feed do Grupo Vorkeza (posts-grupo.html) em PNG 1080 x 1350.
const puppeteer = require('puppeteer-core'), path = require('path'), fs = require('fs');
const OUT = path.resolve(__dirname, '../Pack-Grupo-Vorkeza/2-Fotos');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true, args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  p.on('pageerror', e => console.log('ERRO', e.message));
  await p.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
  await p.goto('file:///' + path.resolve(__dirname, 'posts-grupo.html').replace(/\\/g, '/'));
  await p.evaluate(async () => { await document.fonts.load('800 40px Manrope'); await document.fonts.load('600 40px "DM Sans"'); await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
  fs.mkdirSync(OUT, { recursive: true });
  for (const a of await p.$$('.art')) { const id = await a.evaluate(e => e.id); await a.screenshot({ path: path.join(OUT, id + '.png') }); console.log(id); }
  const over = await p.evaluate(() => [...document.querySelectorAll('.pad')].filter(e => e.scrollHeight > e.clientHeight + 2).map(e => e.parentElement.id));
  console.log('estouro:', JSON.stringify(over));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
