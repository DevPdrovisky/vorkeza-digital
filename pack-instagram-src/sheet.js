// Monta folha de revisão: node sheet.js saida.png colunas larguraPx img1 img2 ...
const puppeteer = require('puppeteer-core'), path = require('path');
(async () => {
  const [out, cols, w, ...imgs] = process.argv.slice(2);
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true, args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  await p.setViewport({ width: cols * (+w + 8), height: 800 });
  const fs = require('fs'), tmp = path.join(__dirname, '_sheet.html');
  fs.writeFileSync(tmp, `<body style="margin:0;background:#333;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:8px">` + imgs.map(i => `<img style="width:${w}px;display:block" src="file:///${path.resolve(i).replace(/\\/g, '/')}">`).join(''));
  await p.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await p.screenshot({ path: out, fullPage: true });
  await b.close(); fs.unlinkSync(tmp);
})();
