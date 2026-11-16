// Vitrine Imóvel — gera no navegador as artes de cada imóvel (status/story 1080x1920, feed 1080x1350, "VENDIDO"/"ALUGADO").
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  let D;
  try { D = JSON.parse($('#vi-artes').textContent); } catch { return; }
  const { loja, imoveis } = D;
  const cv = $('#arte-canvas'), ctx = cv.getContext('2d');
  const dlg = $('#arte-preview'), img = $('#arte-img'), baixar = $('#arte-baixar'), share = $('#arte-share');
  let arquivoAtual = null, urlAtual = null;
  const T = 'Manrope, system-ui, sans-serif', C = '"DM Sans", system-ui, sans-serif';
  const lum = hex => { const h = hex.replace('#', ''); const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4); return .2126 * r + .7152 * g + .0722 * b; };
  const corTxt = lum(loja.cor) > .45 ? '#111317' : '#ffffff';

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function linhas(txt, max, maxLinhas) {
    const out = []; let atual = '';
    for (const p of String(txt).split(/\s+/)) { const t = atual ? atual + ' ' + p : p; if (ctx.measureText(t).width > max && atual) { out.push(atual); atual = p; } else atual = t; }
    if (atual) out.push(atual);
    if (out.length > maxLinhas) { out.length = maxLinhas; let u = out[maxLinhas - 1]; while (ctx.measureText(u + '…').width > max && u.length) u = u.slice(0, -1); out[maxLinhas - 1] = u + '…'; }
    return out;
  }
  const carregarFoto = src => new Promise((ok, erro) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.decoding = 'async'; i.onload = () => ok(i); i.onerror = () => erro(new Error('foto')); i.src = src; });
  function capa(foto, x, y, w, h) { const r = Math.max(w / foto.naturalWidth, h / foto.naturalHeight); const sw = w / r, sh = h / r; ctx.drawImage(foto, (foto.naturalWidth - sw) / 2, (foto.naturalHeight - sh) / 2, sw, sh, x, y, w, h); }
  function pilulaLoja(x, y) {
    const ini = loja.nome.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();
    ctx.font = `800 38px ${T}`;
    const w = Math.min(ctx.measureText(loja.nome).width, 640) + 128;
    ctx.fillStyle = 'rgba(10,11,14,.62)'; rr(x, y, w, 88, 44); ctx.fill();
    ctx.fillStyle = loja.cor; rr(x + 12, y + 12, 64, 64, 18); ctx.fill();
    ctx.fillStyle = corTxt; ctx.font = `800 28px ${T}`; ctx.textAlign = 'center'; ctx.fillText(ini, x + 44, y + 54); ctx.textAlign = 'left';
    ctx.fillStyle = '#fff'; ctx.font = `800 38px ${T}`; ctx.fillText(linhas(loja.nome, 640, 1)[0], x + 96, y + 57);
  }
  function selo(txt, xDir, y) {
    if (!txt) return;
    ctx.font = `700 34px ${C}`;
    const w = ctx.measureText(txt).width + 56;
    ctx.fillStyle = loja.cor; rr(xDir - w, y, w, 72, 36); ctx.fill();
    ctx.fillStyle = corTxt; ctx.fillText(txt, xDir - w + 28, y + 47);
  }
  function chips(itens, x, y, tam) {
    ctx.font = `700 ${tam}px ${C}`;
    let cx = x;
    for (const t of itens.filter(Boolean)) {
      const w = ctx.measureText(t).width + tam * 1.1;
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; rr(cx, y, w, tam * 2, tam); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.fillText(t, cx + tam * .55, y + tam * 1.36);
      cx += w + 16;
    }
  }
  function rodapeCta(y, w, alto) {
    ctx.fillStyle = '#128C4B'; rr(60, y, w - 120, alto, alto / 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `800 ${Math.round(alto * .36)}px ${T}`; ctx.textAlign = 'center';
    ctx.fillText(`WhatsApp ${loja.fone}`, w / 2, y + alto * .63); ctx.textAlign = 'left';
  }
  function site(H, W) { if (loja.site) { ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = `600 34px ${C}`; ctx.textAlign = 'center'; ctx.fillText(loja.site, W / 2, H - 100); ctx.textAlign = 'left'; } }

  async function desenhar(tipo, c) {
    const W = 1080, H = tipo === 'feed' ? 1350 : 1920;
    cv.width = W; cv.height = H;
    ctx.fillStyle = loja.escura; ctx.fillRect(0, 0, W, H);
    const foto = await carregarFoto(c.foto);
    const fim = tipo === 'fim';
    const fotoH = tipo === 'feed' ? 860 : (fim ? H : 1240);
    if (fim && 'filter' in ctx) ctx.filter = 'grayscale(1) brightness(.75)';
    capa(foto, 0, 0, W, fotoH); ctx.filter = 'none';
    const g = ctx.createLinearGradient(0, fim ? 0 : fotoH * .45, 0, fotoH);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, loja.escura);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, fotoH);
    const topo = ctx.createLinearGradient(0, 0, 0, 260); topo.addColorStop(0, 'rgba(0,0,0,.45)'); topo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = topo; ctx.fillRect(0, 0, W, 260);
    pilulaLoja(60, 64);

    if (fim) {
      const palavra = c.finalidade === 'aluguel' ? 'ALUGADO' : 'VENDIDO';
      ctx.save(); ctx.translate(W / 2, 760); ctx.rotate(-0.12);
      ctx.font = `800 180px ${T}`; const tw = ctx.measureText(palavra).width;
      ctx.strokeStyle = loja.cor; ctx.lineWidth = 16; rr(-tw / 2 - 50, -165, tw + 100, 225, 28); ctx.stroke();
      ctx.fillStyle = loja.cor; ctx.textAlign = 'center'; ctx.fillText(palavra, 0, 10); ctx.restore(); ctx.textAlign = 'left';
      ctx.fillStyle = '#fff'; ctx.font = `800 76px ${T}`;
      let y = 1170; for (const l of linhas(c.titulo, W - 120, 2)) { ctx.fillText(l, 60, y); y += 88; }
      ctx.fillStyle = 'rgba(255,255,255,.78)'; ctx.font = `500 44px ${C}`; ctx.fillText(linhas(c.sub, W - 120, 1)[0], 60, y + 4);
      ctx.fillStyle = '#fff'; ctx.font = `700 54px ${T}`; ctx.fillText('Mais um negócio fechado!', 60, y + 130);
      ctx.fillStyle = 'rgba(255,255,255,.78)'; ctx.font = `500 42px ${C}`; ctx.fillText(c.finalidade === 'aluguel' ? 'Procurando para alugar? Chame a gente.' : 'Quer vender ou comprar? Chame a gente.', 60, y + 200);
      rodapeCta(H - 300, W, 132); site(H, W);
      return;
    }

    selo(c.selo, W - 60, 72);
    const feed = tipo === 'feed';
    const s = feed ? { tit: 70, lt: 80, ver: 38, chip: 30, preco: 92, ph: 128, raio: 26, ant: 34 } : { tit: 92, lt: 102, ver: 46, chip: 36, preco: 120, ph: 164, raio: 32, ant: 40 };
    const base = feed ? H - 150 : H - 350;
    const precoY = base - s.ph;
    const antY = c.precoAntigo ? precoY - 18 : precoY;
    const chipsY = antY - (c.precoAntigo ? s.ant + 22 : 0) - 34 - s.chip * 2;
    const subY = chipsY - 28;
    ctx.font = `800 ${s.tit}px ${T}`;
    const tit = linhas(c.titulo, W - 120, 2);
    let y = subY - s.ver - 14 - (tit.length - 1) * s.lt;
    ctx.fillStyle = '#fff';
    for (const l of tit) { ctx.fillText(l, 60, y); y += s.lt; }
    ctx.fillStyle = 'rgba(255,255,255,.78)'; ctx.font = `500 ${s.ver}px ${C}`;
    ctx.fillText(linhas(c.sub, W - 120, 1)[0] || '', 60, subY);
    chips(c.chips, 60, chipsY, s.chip);
    if (c.precoAntigo) { ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = `600 ${s.ant}px ${C}`; const t = `De ${c.precoAntigo}`; ctx.fillText(t, 60, antY); ctx.fillRect(60, antY - s.ant * .33, ctx.measureText(t).width, 4); }
    ctx.font = `800 ${s.preco}px ${T}`;
    const pw = Math.min(ctx.measureText(c.preco).width + s.raio * 2.5, W - 120);
    ctx.fillStyle = loja.cor; rr(60, precoY, pw, s.ph, s.raio); ctx.fill();
    ctx.fillStyle = corTxt; ctx.fillText(c.preco, 60 + s.raio * 1.25, precoY + s.ph * .74);
    if (feed) {
      ctx.fillStyle = '#25D366'; ctx.beginPath(); ctx.arc(80, H - 72, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `700 40px ${C}`; ctx.fillText(`WhatsApp ${loja.fone}`, 110, H - 58);
      const livre = W - 60 - (110 + ctx.measureText(`WhatsApp ${loja.fone}`).width + 40);
      ctx.font = `600 30px ${C}`;
      if (loja.site && ctx.measureText(loja.site).width <= livre) { ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.textAlign = 'right'; ctx.fillText(loja.site, W - 60, H - 60); ctx.textAlign = 'left'; }
    } else { rodapeCta(H - 300, W, 132); site(H, W); }
  }

  async function gerar(tipo, id, botao) {
    const c = imoveis.find(x => x.id === id); if (!c) return;
    const txt = botao.textContent; botao.disabled = true; botao.textContent = 'Gerando…';
    try {
      await Promise.all([document.fonts.load(`800 100px ${T}`), document.fonts.load(`500 40px ${C}`), document.fonts.load(`700 40px ${C}`)]);
      await desenhar(tipo, c);
      const blob = await new Promise(ok => cv.toBlob(ok, 'image/png'));
      const nome = `${c.titulo}-${tipo === 'fim' ? (c.finalidade === 'aluguel' ? 'alugado' : 'vendido') : tipo}.png`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9.]+/g, '-');
      if (urlAtual) URL.revokeObjectURL(urlAtual);
      urlAtual = URL.createObjectURL(blob);
      arquivoAtual = new File([blob], nome, { type: 'image/png' });
      img.src = urlAtual; baixar.href = urlAtual; baixar.download = nome;
      share.hidden = !(navigator.canShare && navigator.canShare({ files: [arquivoAtual] }));
      dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', '');
    } catch (e) {
      alert(c.cors === false ? 'Esta foto vem de outro site, que não permite gerar a arte. No site oficial, com as suas fotos, funciona normalmente.' : 'Não foi possível gerar a arte desta foto. Verifique a internet e tente de novo.');
    } finally { botao.disabled = false; botao.textContent = txt; }
  }

  document.addEventListener('click', e => { const b = e.target.closest('[data-arte]'); if (b) gerar(b.dataset.arte, b.dataset.id, b); });
  share.addEventListener('click', async () => { try { await navigator.share({ files: [arquivoAtual] }); } catch {} });
  $('#arte-fechar').addEventListener('click', () => dlg.close ? dlg.close() : dlg.removeAttribute('open'));
})();
