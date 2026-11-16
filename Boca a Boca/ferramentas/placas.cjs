// Gera os arquivos para impressão das plaquinhas de cada loja: placa.png/pdf (10,5 × 14,8 cm) e adesivo.png/pdf (9 × 9 cm).
// PNG em ~300 dpi. Uso: node ferramentas/placas.cjs [slug]   (rode depois do gerar.mjs; sem slug, faz todas)
const path = require('path'), fs = require('fs');
const { abrir } = require('./capturar.cjs');
const SAIDA = path.resolve(__dirname, '..', '3-Produto', 'saida');
const url = p => 'file:///' + p.split(path.sep).join('/');
(async () => {
  const slugs = process.argv[2] ? [process.argv[2]] : fs.readdirSync(SAIDA).filter(s => fs.existsSync(path.join(SAIDA, s, 'placa', 'index.html')));
  const b = await abrir();
  const erros = [];
  for (const slug of slugs) {
    const pasta = path.join(SAIDA, slug, 'placa');
    const p = await b.newPage();
    p.on('pageerror', e => erros.push(slug + ': ' + e.message));
    await p.setViewport({ width: 1000, height: 900, deviceScaleFactor: 300 / 96 });
    await p.goto(url(path.join(pasta, 'index.html')), { waitUntil: 'networkidle0' });
    await p.evaluate(async () => { await document.fonts.ready; document.body.style.background = 'transparent'; });
    for (const peca of ['placa', 'adesivo']) {
      const el = await p.$(`[data-peca="${peca}"]`);
      await el.screenshot({ path: path.join(pasta, peca + '.png'), omitBackground: true });
      const [w, h] = (await el.evaluate(e => e.dataset.mm)).split('x');
      await p.evaluate(nome => { document.body.dataset.so = nome; for (const e of document.querySelectorAll('.peca, .placas-topo')) e.style.display = e.dataset.peca === nome ? '' : 'none'; document.querySelector('.placas-grade').style.margin = '0'; }, peca);
      await p.pdf({ path: path.join(pasta, peca + '.pdf'), width: w + 'mm', height: h + 'mm', printBackground: true, pageRanges: '1', margin: { top: 0, right: 0, bottom: 0, left: 0 } });
      await p.evaluate(() => { for (const e of document.querySelectorAll('.peca, .placas-topo')) e.style.display = ''; document.querySelector('.placas-grade').style.margin = ''; });
    }
    await p.close();
    console.log(`OK ${slug}: placa.png, placa.pdf, adesivo.png, adesivo.pdf`);
  }
  await b.close();
  if (erros.length) { console.error('ERROS: ' + erros.join(' | ')); process.exit(1); }
})().catch(e => { console.error(e); process.exit(1); });
