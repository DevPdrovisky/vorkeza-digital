(() => {
  'use strict';
  const cfg = window.VM_CONFIG || {};
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const num = String(cfg.whatsapp || '').replace(/\D/g, '');
  const wa = msg => `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  const limpar = (s, n = 80) => String(s || '').replace(/[\r\n]+/g, ' ').trim().slice(0, n);

  // topo escurece ao rolar
  const topo = $('#topo');
  const rolar = () => topo.classList.toggle('rolou', scrollY > 30);
  addEventListener('scroll', rolar, { passive: true }); rolar();

  // links de WhatsApp
  if (num) {
    const geral = wa('Olá! Vim pelo site da Vitrine Motor e quero saber mais sobre o site de estoque para a minha revenda.');
    $('#wa-flut').href = geral; $('#wa-flut').target = '_blank'; $('#wa-flut').rel = 'noopener';
    $('#rodape-wa').href = geral; $('#rodape-wa').target = '_blank'; $('#rodape-wa').rel = 'noopener';
  }
  if (cfg.instagram) { const ig = $('#rodape-ig'); ig.href = cfg.instagram; ig.hidden = false; ig.target = '_blank'; ig.rel = 'noopener'; }

  // vagas de fundador
  const vagas = Number(cfg.vagasFundador);
  if (Number.isFinite(vagas)) { if (vagas <= 0) $('#fundador').hidden = true; else $('#vagas').textContent = vagas === 1 ? '1' : String(vagas); }

  // botões de plano preenchem o formulário
  $$('[data-plano]').forEach(b => b.addEventListener('click', () => { $('#f-plano').value = b.dataset.plano; }));

  // calculadora
  const lucro = $('#lucro');
  const ano = 997 + 149 * 12;
  const brl = n => 'R$ ' + Math.round(n).toLocaleString('pt-BR');
  function calc() {
    const v = Number(lucro.value.replace(/\D/g, '')) || 0;
    lucro.value = v ? v.toLocaleString('pt-BR') : '';
    $('#c-ano').textContent = brl(ano);
    $('#c-carros').textContent = v ? String(Math.max(1, Math.ceil(ano / v))) : '–';
  }
  lucro.addEventListener('input', calc); calc();

  // formulário -> WhatsApp
  $('#form-previa').addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const ok = limpar(d.nome) && limpar(d.revenda) && limpar(d.cidade);
    $('#form-erro').hidden = !!ok;
    if (!ok) return;
    const msg = `Olá! Quero a prévia grátis da Vitrine Motor.\n\nNome: ${limpar(d.nome, 50)}\nRevenda: ${limpar(d.revenda, 60)}\nCidade: ${limpar(d.cidade, 50)}\nCarros no pátio: ${limpar(d.qtd, 20)}\nOnde estão os carros: ${limpar(d.link, 200) || 'vou mandar aqui'}\nPlano: ${limpar(d.plano, 20)}`;
    if (!num) { alert('WhatsApp ainda não configurado em config.js.'); return; }
    const url = wa(msg);
    const w = window.open(url, '_blank', 'noopener'); if (!w) location.href = url;
  });

  // animação de entrada
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const alvos = $$('.dor-grade article, .rec, .passos li, .plano, .conta-in, .artes-imgs, .faq details');
    alvos.forEach(a => a.classList.add('revelar'));
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visivel'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    alvos.forEach(a => io.observe(a));
  }
})();
