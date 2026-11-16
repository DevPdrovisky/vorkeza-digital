// Tira fotos de seções de um site local para conferência.
// Uso: node conferir-site.js <url> <largura> <altura> <saida-prefixo> <seletor1> [seletor2 ...]
const puppeteer = require('puppeteer-core'), path = require('path');
const [url, w, h, pref, ...sels] = process.argv.slice(2);
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true });
  const p = await b.newPage();
  const erros = [];
  p.on('pageerror', e => erros.push(e.message));
  p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  await p.setViewport({ width: +w, height: +h, deviceScaleFactor: 1, isMobile: +w < 700, hasTouch: +w < 700 });
  await p.goto(url, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  let i = 0;
  for (const s of sels) {
    const [sel, off] = s.split('@');
    const ok = await p.evaluate((sel, off) => {
      const el = document.querySelector(sel); if (!el) return false;
      document.documentElement.style.scrollBehavior = 'auto';
      scrollTo(0, el.getBoundingClientRect().top + scrollY - Number(off || 70));
      return true;
    }, sel, off);
    if (!ok) { console.log('não achei', sel); continue; }
    await new Promise(r => setTimeout(r, Number(process.env.ESPERA || 1800)));
    const f = path.resolve(`${pref}-${++i}.jpg`);
    await p.screenshot({ path: f, type: 'jpeg', quality: 70 });
    console.log(f);
  }
  const larg = await p.evaluate(() => document.documentElement.scrollWidth);
  console.log('largura da página:', larg, 'erros:', JSON.stringify(erros));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
