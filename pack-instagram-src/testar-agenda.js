// Testa o agendamento do site de um cliente (sem abrir WhatsApp de verdade).
// Uso: node testar-agenda.js <url>
const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true });
  const p = await b.newPage();
  const erros = [];
  p.on('pageerror', (e) => erros.push(e.message));
  await p.goto(process.argv[2], { waitUntil: 'networkidle0' });
  const r = await p.evaluate(() => {
    let aberto = null; window.open = (u) => { aberto = u; };
    const f = document.getElementById('agenda');
    f.requestSubmit();
    const erro1 = document.getElementById('agErro').textContent;
    f.querySelector('#agServicos input').click();
    const d = f.querySelectorAll('input[name=agDia]'); d[1].click();
    const h = f.querySelectorAll('input[name=agHora]'); h[1].click();
    document.getElementById('agNome').value = 'Teste';
    document.getElementById('agCarro').value = 'Onix 2019';
    f.requestSubmit();
    return { erro1, dias: d.length, horas: h.length, msg: decodeURIComponent(aberto || ''), okVisivel: !document.getElementById('agOk').hidden, ics: decodeURIComponent(document.getElementById('agIcs').href).slice(0, 400), luzes: document.querySelectorAll('.luz').length };
  });
  console.log(JSON.stringify(r, null, 2), 'erros:', erros);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
