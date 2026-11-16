// node render-stories.js  -> Stories (1080 x 1920) e post de anúncio do Pedro (1080 x 1350)
const puppeteer = require('puppeteer-core'), path = require('path'), fs = require('fs');
const OUT = path.resolve(__dirname, '../Pack-Instagram-Vorkeza');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true, args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  p.on('pageerror', e => console.log('ERRO', e.message));
  await p.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await p.goto('file:///' + path.resolve(__dirname, 'stories.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await p.evaluate(async () => { await document.fonts.load('800 40px Manrope'); await document.fonts.load('700 40px "DM Sans"'); await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
  const dirS = path.join(OUT, '4-Stories'), dirP = path.join(OUT, '5-Seu-perfil');
  fs.mkdirSync(dirS, { recursive: true }); fs.mkdirSync(dirP, { recursive: true });
  for (const el of await p.$$('.story, .art')) {
    const { id, story } = await el.evaluate(e => ({ id: e.id, story: e.classList.contains('story') }));
    await el.screenshot({ path: path.join(story ? dirS : dirP, id + '.png') });
    console.log(id);
  }
  // conteúdo que passa da área segura ou estoura o quadro
  const over = await p.evaluate(() => [...document.querySelectorAll('.sp,.pad')].filter(e => e.scrollHeight > e.clientHeight + 2).map(e => e.parentElement.id + ' ' + e.scrollHeight + '/' + e.clientHeight));
  console.log('estouro:', JSON.stringify(over));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
