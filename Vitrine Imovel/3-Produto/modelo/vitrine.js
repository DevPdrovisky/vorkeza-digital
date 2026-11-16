// Vitrine Imóvel — filtros, galeria, compartilhar e formulários que viram mensagem no WhatsApp.
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  let dados = {};
  try { dados = JSON.parse($('#vi-dados')?.textContent || '{}'); } catch {}
  const loja = dados.loja || {};
  const prefixo = loja.modo === 'demo' ? '[Teste na demonstração da Vitrine Imóvel] ' : '';
  const wa = msg => `https://wa.me/${String(loja.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(prefixo + msg)}`;
  const abrir = url => { const w = window.open(url, '_blank', 'noopener'); if (!w) location.href = url; };
  const normal = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const limpar = (s, max = 60) => String(s || '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
  function toast(txt) { const t = $('#toast'); if (!t) return; t.textContent = txt; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 2400); }

  // ---------- lista de imóveis ----------
  const grade = $('#grade');
  if (grade && document.body.classList.contains('pg-inicio')) {
    const cards = $$('.card', grade), original = cards.slice();
    const CAMPOS = ['tipo', 'cidade', 'bairro', 'preco', 'quartos', 'suites', 'vagas', 'area', 'condominio', 'iptu', 'ordem'];
    const el = Object.fromEntries(CAMPOS.map(k => [k, $('#f-' + k)]).filter(([, v]) => v));
    const busca = $('#busca');
    let fin = '';
    const params = new URLSearchParams(location.search);
    if (params.get('q')) busca.value = params.get('q');
    if (['venda', 'aluguel'].includes(params.get('finalidade'))) fin = params.get('finalidade');
    for (const k in el) if (params.get(k)) el[k].value = params.get(k);

    const toggle = $('.filtros-toggle'), filtros = $('#filtros'), contador = $('#filtros-n');
    toggle?.addEventListener('click', () => { const a = filtros.classList.toggle('aberto'); toggle.setAttribute('aria-expanded', String(a)); });
    if (Object.keys(el).some(k => k !== 'ordem' && params.get(k))) { filtros.classList.add('aberto'); toggle?.setAttribute('aria-expanded', 'true'); }

    const marcarChips = () => $$('.chip').forEach(c => { const on = c.dataset.fin === fin; c.classList.toggle('ativo', on); c.setAttribute('aria-pressed', String(on)); });
    $$('.chip').forEach(c => c.addEventListener('click', () => {
      fin = c.dataset.fin;
      if (el.preco?.value && fin && !el.preco.value.startsWith(fin)) el.preco.value = '';
      marcarChips(); aplicar(true);
    }));
    $('#limpar')?.addEventListener('click', () => { for (const k in el) el[k].value = ''; busca.value = ''; fin = ''; marcarChips(); aplicar(true); });

    function aplicar(salvar) {
      const termos = normal(busca.value).split(' ').filter(Boolean);
      const v = k => el[k]?.value || '';
      const [pFin, pMax] = v('preco') ? v('preco').split(':') : ['', ''];
      if (pFin && fin !== pFin) { fin = pFin; marcarChips(); }
      let n = 0;
      for (const c of cards) {
        const d = c.dataset;
        const ok = (!fin || d.finalidade === fin) && (!v('tipo') || d.tipo === v('tipo')) && (!v('cidade') || d.cidade === v('cidade')) && (!v('bairro') || d.bairro === v('bairro'))
          && (!pMax || +d.preco <= +pMax) && (!v('quartos') || +d.quartos >= +v('quartos')) && (!v('suites') || +d.suites >= +v('suites'))
          && (!v('vagas') || +d.vagas >= +v('vagas')) && (!v('area') || +d.area >= +v('area'))
          && (v('condominio') === '' || (d.condominio !== '' && +d.condominio <= +v('condominio')))
          && (v('iptu') === '' || (d.iptu !== '' && d.finalidade === (+v('iptu') <= 100 ? 'aluguel' : 'venda') && +d.iptu <= +v('iptu')))
          && termos.every(t => d.busca.includes(t));
        c.hidden = !ok; if (ok) n++;
      }
      const peso = s => ({ disponivel: 0, reservado: 1, vendido: 2, alugado: 2 }[s] ?? 0);
      const lista = original.slice();
      if (v('ordem')) {
        const [campo, dir] = v('ordem').split('-');
        lista.sort((a, b) => peso(a.dataset.status) - peso(b.dataset.status) || (dir === 'asc' ? 1 : -1) * (campo === 'entrada' ? a.dataset.entrada.localeCompare(b.dataset.entrada) : +a.dataset[campo] - +b.dataset[campo]));
      }
      lista.forEach(c => grade.appendChild(c));
      $('#contagem').textContent = (n === 1 ? '1 imóvel' : `${n} imóveis`) + (fin ? (fin === 'venda' ? ' para comprar' : ' para alugar') : '');
      $('#vazio').hidden = n > 0;
      const ativos = Object.keys(el).filter(k => k !== 'ordem' && v(k)).length;
      if (contador) { contador.hidden = !ativos; contador.textContent = String(ativos); }
      if (n === 0) {
        const procura = [v('tipo'), fin === 'aluguel' ? 'para alugar' : fin === 'venda' ? 'para comprar' : '', v('bairro') && `no ${v('bairro')}`, v('quartos') && `com ${v('quartos')}+ quartos`, busca.value.trim()].filter(Boolean).join(' ');
        $('#vazio-wa').href = wa(`Olá! Estou procurando ${procura ? `um imóvel: ${procura}` : 'um imóvel'} e não achei no site de ${loja.nome}. Vocês conseguem pra mim?`);
      }
      if (salvar) {
        const p = new URLSearchParams();
        if (busca.value.trim()) p.set('q', busca.value.trim());
        if (fin) p.set('finalidade', fin);
        for (const k in el) if (el[k].value) p.set(k, el[k].value);
        history.replaceState(null, '', (p.toString() ? '?' + p : location.pathname) + location.hash);
      }
    }
    let t;
    busca.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => aplicar(true), 120); });
    $('#busca-form').addEventListener('submit', e => { e.preventDefault(); aplicar(true); $('#imoveis').scrollIntoView({ behavior: 'smooth' }); busca.blur(); });
    for (const k in el) el[k].addEventListener('change', () => aplicar(true));
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
    trilho.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const i = atual(); if (cont) cont.textContent = `${i + 1} / ${itens.length}`; minis.forEach((m, j) => m.classList.toggle('ativa', i === j)); }); }, { passive: true });
  }

  // ---------- compartilhar ----------
  $('#compartilhar')?.addEventListener('click', async () => {
    const c = dados.imovel || {};
    const url = c.url || location.href.split('?')[0];
    const texto = `${c.nome} (${c.bairro}) — ${c.precoTxt} | ${loja.nome}`;
    if (navigator.share) { try { await navigator.share({ title: c.nome, text: texto, url }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(`${texto}\n${url}`); toast('Link copiado'); } catch { prompt('Copie o link:', url); }
  });

  // ---------- formulários -> WhatsApp ----------
  $$('.form-wa').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(f));
    const c = dados.imovel || {};
    const ref = c.id ? `\n\nRef. #${c.id}${c.url ? `\n${c.url}` : ''}` : '';
    let msg = '';
    if (f.dataset.tipo === 'visita') msg = `Olá! Quero agendar uma visita ao imóvel "${c.nome}" (${c.bairro}).\nQuando: ${limpar(v.dia, 20)}, de ${limpar(v.periodo, 10).toLowerCase()}` + ref;
    else if (f.dataset.tipo === 'financiamento') msg = `Olá${v.nome ? `, sou ${limpar(v.nome, 40)}` : ''}! Quero simular o financiamento do imóvel "${c.nome}" (${c.precoTxt}).\nEntrada: ${v.entrada ? 'R$ ' + limpar(v.entrada, 14) : 'a combinar'}\nPrazo: ${limpar(v.prazo, 12)}` + ref;
    else if (f.dataset.tipo === 'alugar') msg = `Olá! Quero alugar o imóvel "${c.nome}" (${c.precoTxt}).\nGarantia: ${limpar(v.garantia, 20)}\nMudança: ${limpar(v.mudanca, 20).toLowerCase()}` + ref;
    else if (f.dataset.tipo === 'anunciar') msg = `Olá! Quero ${limpar(v.finalidade, 10).toLowerCase()} meu imóvel com ${loja.nome}.\nTipo: ${limpar(v.tipo, 20)}\nBairro: ${limpar(v.bairro, 50)}\nPosso mandar fotos por aqui.`;
    abrir(wa(msg));
  }));
})();
