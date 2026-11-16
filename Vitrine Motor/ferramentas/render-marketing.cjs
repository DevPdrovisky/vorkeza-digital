// Renderiza 4-Marketing/fonte/artes.html em PNGs (posts, stories, perfil) e a og-image do site.
const path = require('path'), fs = require('fs');
const { abrir } = require('./capturar.cjs');
const RAIZ = path.resolve(__dirname, '..');
const OUT = path.join(RAIZ, '4-Marketing');
(async () => {
  const b = await abrir(); const p = await b.newPage();
  p.on('pageerror', e => console.log('ERRO', e.message));
  await p.setViewport({ width: 1300, height: 2000, deviceScaleFactor: 1 });
  await p.goto('file:///' + path.join(OUT, 'fonte', 'artes.html').replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await p.evaluate(async () => { await document.fonts.ready; });
  for (const pasta of ['1-Posts', '2-Stories', '3-Perfil']) fs.mkdirSync(path.join(OUT, pasta), { recursive: true });
  for (const a of await p.$$('.art')) {
    const id = await a.evaluate(e => e.id);
    const destino = id === 'og-image' ? path.join(RAIZ, '2-Site', 'assets', 'og-image.png')
      : path.join(OUT, id.startsWith('post') ? '1-Posts' : id.startsWith('story') ? '2-Stories' : '3-Perfil', id + '.png');
    await a.screenshot({ path: destino });
    console.log(path.relative(RAIZ, destino));
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
