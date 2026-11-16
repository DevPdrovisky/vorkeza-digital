const puppeteer = require('puppeteer-core'), path = require('path'), fs = require('fs');
const OUT = path.resolve(__dirname, '../Pack-Instagram-Vorkeza');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true, args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  p.on('pageerror', e => console.log('ERRO', e.message));
  await p.setViewport({ width: 6480, height: 1350, deviceScaleFactor: 1 });
  await p.goto('file:///' + path.resolve(__dirname, 'stills.html').replace(/\\/g, '/'));
  await p.evaluate(async () => { await document.fonts.load('800 40px Manrope'); await document.fonts.load('700 40px "DM Sans"'); await document.fonts.ready; });
  const posts = path.join(OUT, '1-Posts'), car = path.join(OUT, '2-Carrosseis');
  fs.mkdirSync(posts, { recursive: true }); fs.mkdirSync(car, { recursive: true });
  for (const a of await p.$$('.art')) {
    const id = await a.evaluate(e => e.id);
    await a.screenshot({ path: path.join(posts, id + '.png') });
    console.log(id);
  }
  for (const s of await p.$$('.strip')) {
    const name = await s.evaluate(e => e.dataset.slides);
    const dir = path.join(car, name);
    fs.mkdirSync(dir, { recursive: true });
    // Deixa só este carrossel na página, para o recorte começar no topo.
    await s.evaluate(e => { document.querySelectorAll('.art,.strip').forEach(x => x.style.display = x === e ? '' : 'none'); e.style.marginBottom = 0; window.scrollTo(0, 0); });
    for (let i = 0; i < 6; i++) {
      await p.screenshot({ path: path.join(dir, `slide-${i + 1}.png`), clip: { x: i * 1080, y: 0, width: 1080, height: 1350 } });
    }
    console.log(name);
  }
  const over = await p.evaluate(() => [...document.querySelectorAll('.pad,.slide')].filter(e => e.scrollHeight > e.clientHeight + 2).map(e => (e.parentElement.id || e.parentElement.dataset.slides) + ' [' + [...e.parentElement.children].indexOf(e) + '] ' + e.scrollHeight));
  console.log('estouro:', JSON.stringify(over));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
