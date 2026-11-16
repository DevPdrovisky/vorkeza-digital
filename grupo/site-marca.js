// Grupo Vorkeza — comportamento comum dos sites de vendas das marcas.
// Lê window.MARCA_CONFIG = { whatsapp, instagram, vagasFundador, mensagemGeral } (config.js de cada marca).
// Formulário: <form class="form" data-wa="Título da mensagem"> — cada campo vira "Rótulo: valor" na mensagem do WhatsApp.
(() => {
  'use strict';
  const cfg = window.MARCA_CONFIG || {};
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const num = String(cfg.whatsapp || '').replace(/\D/g, '');
  const wa = msg => `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  const limpar = (s, n = 120) => String(s || '').replace(/[\r\n]+/g, ' ').trim().slice(0, n);

  const topo = $('#topo');
  if (topo) { const rolar = () => topo.classList.toggle('rolou', scrollY > 30); addEventListener('scroll', rolar, { passive: true }); rolar(); }

  if (num) {
    const geral = wa(cfg.mensagemGeral || 'Olá! Vim pelo site e quero saber mais.');
    $$('[data-wa-geral]').forEach(a => { a.href = geral; a.target = '_blank'; a.rel = 'noopener'; });
  }
  if (cfg.instagram) $$('[data-instagram]').forEach(a => { a.href = cfg.instagram; a.hidden = false; a.target = '_blank'; a.rel = 'noopener'; });

  const vagas = Number(cfg.vagasFundador);
  if (Number.isFinite(vagas)) { if (vagas <= 0) $$('[data-fundador]').forEach(e => { e.hidden = true; }); else $$('[data-vagas]').forEach(e => { e.textContent = String(vagas); }); }

  $$('[data-plano]').forEach(b => b.addEventListener('click', () => { const s = $('[name="plano"]'); if (s) s.value = b.dataset.plano; }));

  $$('form[data-wa]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const faltando = [...f.querySelectorAll('[required]')].filter(i => !limpar(i.value));
    const erro = f.querySelector('.form-erro');
    if (erro) erro.hidden = !faltando.length;
    if (faltando.length) { faltando[0].focus(); return; }
    const linhas = [...f.querySelectorAll('input, select, textarea')].filter(i => i.name && limpar(i.value)).map(i => {
      const rot = i.closest('label')?.querySelector('span')?.textContent.replace(/\s*\(.*\)\s*$/, '') || i.name;
      return `${rot}: ${limpar(i.value, i.name === 'link' ? 200 : 80)}`;
    });
    const msg = `${f.dataset.wa}\n\n${linhas.join('\n')}`;
    if (!num) { alert('WhatsApp ainda não configurado em config.js.'); return; }
    const url = wa(msg); const w = window.open(url, '_blank', 'noopener'); if (!w) location.href = url;
  }));

  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const alvos = $$('.grade-3 > *, .rec, .passos li, .plano, .faixa-imgs, .faq details');
    alvos.forEach(a => a.classList.add('revelar'));
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visivel'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    alvos.forEach(a => io.observe(a));
  }
})();
