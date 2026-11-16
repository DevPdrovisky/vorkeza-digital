// Vitrine Motor — filtros do estoque, galeria, compartilhar e formulários que viram mensagem no WhatsApp.
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  let dados = {};
  try { dados = JSON.parse($('#vm-dados')?.textContent || '{}'); } catch {}
  const loja = dados.loja || {};
  const prefixo = loja.modo === 'demo' ? '[Teste na demonstração da Vitrine Motor] ' : '';
  const wa = msg => `https://wa.me/${String(loja.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(prefixo + msg)}`;
  const abrir = url => { const w = window.open(url, '_blank', 'noopener'); if (!w) location.href = url; };
  const normal = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const limpar = (s, max = 60) => String(s || '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);

  function toast(txt) {
    const t = $('#toast'); if (!t) return;
    t.textContent = txt; t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 2400);
  }

  // ---------- estoque ----------
  const grade = $('#grade');
  if (grade && document.body.classList.contains('pg-inicio')) {
    const cards = $$('.card', grade);
    const ordemOriginal = cards.slice();
    const el = { busca: $('#busca'), marca: $('#f-marca'), preco: $('#f-preco'), ano: $('#f-ano'), cambio: $('#f-cambio'), ordem: $('#f-ordem') };
    let categoria = '';
    const params = new URLSearchParams(location.search);
    if (params.get('q')) el.busca.value = params.get('q');
    for (const k of ['marca', 'preco', 'ano', 'cambio', 'ordem']) if (params.get(k) && el[k]) el[k].value = params.get(k);
    if (params.get('categoria')) categoria = params.get('categoria');

    const toggle = $('.filtros-toggle'), filtros = $('#filtros');
    toggle?.addEventListener('click', () => {
      const aberto = filtros.classList.toggle('aberto');
      toggle.setAttribute('aria-expanded', String(aberto));
    });
    if (['marca', 'preco', 'ano', 'cambio', 'ordem'].some(k => params.get(k))) { filtros.classList.add('aberto'); toggle?.setAttribute('aria-expanded', 'true'); }

    function marcarChips() { $$('.chip').forEach(c => c.classList.toggle('ativo', c.dataset.cat === categoria)); }
    $$('.chip').forEach(c => c.addEventListener('click', () => { categoria = c.dataset.cat; marcarChips(); aplicar(true); }));

    function aplicar(salvar) {
      const termos = normal(el.busca.value).split(' ').filter(Boolean);
      const marca = el.marca.value, preco = +el.preco.value || 0, ano = +el.ano.value || 0, cambio = el.cambio.value;
      let n = 0;
      for (const c of cards) {
        const d = c.dataset;
        const ok = (!categoria || d.categoria === categoria) && (!marca || d.marca === marca) && (!preco || +d.preco <= preco)
          && (!ano || +d.ano >= ano) && (!cambio || d.cambio === cambio) && termos.every(t => d.busca.includes(t));
        c.hidden = !ok; if (ok) n++;
      }
      const ordem = el.ordem.value;
      const peso = s => ({ disponivel: 0, reservado: 1, vendido: 2 }[s] ?? 0);
      const lista = ordemOriginal.slice();
      if (ordem) {
        const [campo, dir] = ordem.split('-');
        lista.sort((a, b) => peso(a.dataset.status) - peso(b.dataset.status) || (dir === 'asc' ? 1 : -1) * (+a.dataset[campo] - +b.dataset[campo]));
      }
      lista.forEach(c => grade.appendChild(c));
      $('#contagem').textContent = n === 1 ? '1 veículo' : `${n} veículos`;
      $('#vazio').hidden = n > 0;
      if (n === 0) {
        const procura = [categoria, marca, el.busca.value.trim()].filter(Boolean).join(' ');
        $('#vazio-wa').href = wa(`Olá! Estou procurando ${procura ? `um ${procura}` : 'um carro'} e não achei no site da ${loja.nome}. Vocês conseguem pra mim?`);
      }
      if (salvar) {
        const p = new URLSearchParams();
        if (el.busca.value.trim()) p.set('q', el.busca.value.trim());
        if (categoria) p.set('categoria', categoria);
        for (const k of ['marca', 'preco', 'ano', 'cambio', 'ordem']) if (el[k].value) p.set(k, el[k].value);
        history.replaceState(null, '', (p.toString() ? '?' + p : location.pathname) + location.hash);
      }
    }
    let t;
    el.busca.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => aplicar(true), 120); });
    $('#busca-form').addEventListener('submit', e => { e.preventDefault(); aplicar(true); $('#estoque').scrollIntoView({ behavior: 'smooth' }); el.busca.blur(); });
    for (const k of ['marca', 'preco', 'ano', 'cambio', 'ordem']) el[k].addEventListener('change', () => aplicar(true));
    marcarChips(); aplicar(false);
  }

  // ---------- galeria ----------
  const trilho = $('#trilho');
  if (trilho) {
    const itens = $$('.galeria-item', trilho), minis = $$('.mini'), cont = $('#galeria-cont');
    const atual = () => Math.round(trilho.scrollLeft / trilho.clientWidth);
    const ir = i => trilho.scrollTo({ left: Math.max(0, Math.min(itens.length - 1, i)) * trilho.clientWidth, behavior: 'smooth' });
    $('.galeria-btn.ant')?.addEventListener('click', () => ir(atual() - 1));
    $('.galeria-btn.prox')?.addEventListener('click', () => ir(atual() + 1));
    minis.forEach(m => m.addEventListener('click', () => ir(+m.dataset.i)));
    trilho.addEventListener('keydown', e => { if (e.key === 'ArrowRight') ir(atual() + 1); if (e.key === 'ArrowLeft') ir(atual() - 1); });
    let raf;
    trilho.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { const i = atual(); if (cont) cont.textContent = `${i + 1} / ${itens.length}`; minis.forEach((m, j) => m.classList.toggle('ativa', i === j)); });
    }, { passive: true });
  }

  // ---------- compartilhar ----------
  $('#compartilhar')?.addEventListener('click', async () => {
    const c = dados.carro || {};
    const url = c.url || location.href.split('?')[0];
    const texto = `${c.nome} — ${c.precoTxt} na ${loja.nome}`;
    if (navigator.share) { try { await navigator.share({ title: c.nome, text: texto, url }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(`${texto}\n${url}`); toast('Link copiado'); } catch { prompt('Copie o link:', url); }
  });

  // ---------- formulários -> WhatsApp ----------
  $$('.form-wa').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(f));
    const c = dados.carro || {};
    const ref = c.id ? `\n\nRef. #${c.id}${c.url ? `\n${c.url}` : ''}` : '';
    let msg = '';
    if (f.dataset.tipo === 'financiamento') {
      msg = `Olá${v.nome ? `, sou ${limpar(v.nome, 40)}` : ''}! Quero simular o financiamento do ${c.nome} (${c.precoTxt}).` +
        `\nEntrada: ${v.entrada ? 'R$ ' + limpar(v.entrada, 14) : 'a combinar'}\nParcelas: ${limpar(v.prazo, 5)}` + ref;
    } else if (f.dataset.tipo === 'troca') {
      msg = `Olá! Tenho interesse no ${c.nome} e quero dar meu carro na troca.\nMeu carro: ${limpar(v.modelo)} ${limpar(v.ano, 9)}${v.km ? `, ${limpar(v.km, 9)} km` : ''}` + ref;
    } else if (f.dataset.tipo === 'visita') {
      msg = `Olá! Quero agendar uma visita para ver o ${c.nome}.\nQuando: ${limpar(v.dia, 20)}, de ${limpar(v.periodo, 10).toLowerCase()}` + ref;
    } else if (f.dataset.tipo === 'vender') {
      msg = `Olá! Quero vender/trocar meu carro com a ${loja.nome}.\nCarro: ${limpar(v.modelo)} ${limpar(v.ano, 9)}${v.km ? `, ${limpar(v.km, 9)} km` : ''}\nConsigo mandar fotos por aqui.`;
    }
    abrir(wa(msg));
  }));
})();
