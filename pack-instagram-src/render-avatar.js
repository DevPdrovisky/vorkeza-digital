// Foto de perfil do Instagram (1080 x 1080). node render-avatar.js <pasta-da-previa>
const puppeteer = require('puppeteer-core'), path = require('path'), fs = require('fs');
const OUT = path.resolve(__dirname, '../Pack-Instagram-Vorkeza/0-Perfil'), file = path.join(OUT, 'foto-de-perfil.png'), prevDir = process.argv[2];
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080" fill="none">
<defs>
 <linearGradient id="b" x1="120" y1="40" x2="960" y2="1040" gradientUnits="userSpaceOnUse"><stop stop-color="#a855f7"/><stop offset=".55" stop-color="#7e22ce"/><stop offset="1" stop-color="#3b0764"/></linearGradient>
 <radialGradient id="p" cx="820" cy="240" r="620" gradientUnits="userSpaceOnUse"><stop stop-color="#ec4899" stop-opacity=".85"/><stop offset="1" stop-color="#ec4899" stop-opacity="0"/></radialGradient>
 <radialGradient id="n" cx="180" cy="980" r="640" gradientUnits="userSpaceOnUse"><stop stop-color="#13071f" stop-opacity=".8"/><stop offset="1" stop-color="#13071f" stop-opacity="0"/></radialGradient>
 <filter id="s" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="26" stdDeviation="30" flood-color="#2a0f4d" flood-opacity=".55"/></filter>
</defs>
<rect width="1080" height="1080" fill="url(#b)"/><rect width="1080" height="1080" fill="url(#p)"/><rect width="1080" height="1080" fill="url(#n)"/>
<g filter="url(#s)" transform="translate(540 548) scale(8.5) translate(-64 -65)">
 <path d="M33 36L64 94L95 36" stroke="#fff" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
 <circle cx="95" cy="36" r="11.5" fill="#f5b8ff"/>
</g></svg>`;
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true });
  const p = await b.newPage();
  await p.setViewport({ width: 1080, height: 1080 });
  await p.setContent(`<!doctype html><body style="margin:0">${SVG}</body>`);
  await p.screenshot({ path: file });
  if (prevDir) { // como aparece no Instagram: recorte em círculo, claro e escuro
    const src = 'data:image/png;base64,' + fs.readFileSync(file).toString('base64');
    const c = (s, ring) => `<img src="${src}" style="width:${s}px;height:${s}px;border-radius:50%;${ring ? 'outline:3px solid #dbdbdb;outline-offset:3px' : ''}">`;
    const panel = (bg, fg) => `<div style="background:${bg};color:${fg};padding:40px;display:flex;align-items:center;gap:40px">${c(420)}${c(150)}${c(77)}${c(44)}<span style="font:700 26px sans-serif">vorkeza.digital</span></div>`;
    await p.setViewport({ width: 1100, height: 1000 });
    await p.setContent(`<!doctype html><body style="margin:0">${panel('#fff', '#111')}${panel('#000', '#fff')}</body>`, { waitUntil: 'load' });
    await p.screenshot({ path: path.join(prevDir, 'avatar.png'), fullPage: true });
  }
  await b.close();
  console.log('ok', fs.statSync(file).size);
})().catch(e => { console.error(e); process.exit(1); });
