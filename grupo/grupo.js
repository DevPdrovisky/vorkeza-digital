/* Grupo Vorkeza — selo, botão de troca entre marcas e cartões "Nossas marcas".
   Uso em qualquer site do grupo:
     <link rel="stylesheet" href="grupo/grupo.css">
     <script src="grupo/grupo.js" data-marca="vitrinemotor" defer></script>
   Opções no <script>: data-marca="<id da marca atual>" · data-troca="nao" (sem a aba de troca).
   No HTML: <a class="vk-selo" data-vk-selo href="https://vorkeza.com.br/">uma empresa Vorkeza</a>
            <a data-vk-link="vitrineimovel" href="...">...</a>   (o href vem de grupo.json)
            <div class="vk-marcas" data-vk-marcas></div>          (cartões das marcas)
   Os dados ficam em grupo.json, na mesma pasta deste arquivo. */
(() => {
  'use strict';
  const script = document.currentScript;
  const base = script && script.src ? new URL('.', script.src).href : 'grupo/';
  const atual = (script && script.dataset.marca) || document.documentElement.dataset.vkMarca || '';
  const comTroca = !(script && script.dataset.troca === 'nao');
  const NS = 'http://www.w3.org/2000/svg';

  const lum = hex => {
    const h = String(hex).replace('#', '');
    const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
    return .2126 * r + .7152 * g + .0722 * b;
  };
  const tinta = cor => lum(cor) > .4 ? '#2A1A00' : '#FFFFFF';

  function el(tag, attrs = {}, filhos = []) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'texto') e.textContent = v; else e.setAttribute(k, v === true ? '' : v);
    }
    for (const f of [].concat(filhos)) if (f) e.append(f);
    return e;
  }
  function svg(conteudo, viewBox = '0 0 24 24') {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', viewBox); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
    s.innerHTML = conteudo; // conteúdo vem só de grupo.json, mantido por nós
    return s;
  }
  function tile(m) {
    const t = el('span', { class: 'vk-tile' }, svg(m.icone));
    t.style.setProperty('--vk-cor', m.cor);
    t.style.setProperty('--vk-ink', tinta(m.cor));
    return t;
  }
  const seta = () => svg('<path d="M7 17 17 7M9 7h8v8"/>');

  fetch(base + 'grupo.json', { cache: 'no-cache' }).then(r => r.json()).then(iniciar).catch(() => {});

  function iniciar(g) {
    const marcas = g.marcas || [];
    const porId = Object.fromEntries(marcas.map(m => [m.id, m]));
    const mae = porId[g.mae] || marcas[0];

    // links que apontam para outra marca
    document.querySelectorAll('[data-vk-link]').forEach(a => { const m = porId[a.dataset.vkLink]; if (m) a.href = m.url; });

    // selo "uma empresa Vorkeza"
    document.querySelectorAll('[data-vk-selo]').forEach(a => {
      if (a.tagName === 'A') { a.href = mae.url; if (!a.rel) a.rel = 'noopener'; }
      a.replaceChildren(tile(mae), el('span', {}, [document.createTextNode('uma empresa '), el('b', { texto: mae.nome.split(' ')[0] })]));
      a.setAttribute('aria-label', `Uma empresa ${mae.nome} — conheça o grupo`);
    });

    // cartões das marcas
    document.querySelectorAll('[data-vk-marcas]').forEach(box => {
      box.replaceChildren(...marcas.filter(m => m.id !== mae.id).map(m => {
        const a = el('a', { class: 'vk-cartao', href: m.url, target: '_blank', rel: 'noopener' }, [
          tile(m), el('h3', { texto: m.nome }), el('p', { texto: m.frase }),
          el('span', { class: 'vk-cartao-link' }, [document.createTextNode('Conhecer o site'), seta()]),
        ]);
        a.style.setProperty('--vk-cor', m.cor);
        return a;
      }));
    });

    if (comTroca && marcas.length > 1) montarTroca(marcas, mae, porId[atual] || mae);
  }

  function montarTroca(marcas, mae, eu) {
    const raiz = document.documentElement;
    const aba = el('button', {
      class: 'vk-aba', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'vk-painel', 'aria-haspopup': 'dialog',
      'aria-label': `Sites do Grupo ${mae.nome.split(' ')[0]}. Você está em: ${eu.nome}`,
    }, [tile(eu), el('span', { class: 'vk-aba-dica', 'aria-hidden': 'true', texto: 'Sites do grupo' })]);

    const itens = marcas.map((m, i) => {
      const aqui = m.id === eu.id;
      const nome = el('span', { class: 'vk-item-nome' }, [document.createTextNode(m.nome),
        m.id === mae.id ? el('span', { class: 'vk-mae', texto: 'Empresa mãe' }) : null,
        aqui ? el('span', { class: 'vk-aqui', texto: 'Você está aqui' }) : null]);
      const a = el('a', { class: 'vk-item', href: m.url, 'aria-current': aqui ? 'page' : null }, [
        tile(m), el('span', {}, [nome, el('span', { class: 'vk-item-frase', texto: m.frase })]),
      ]);
      a.style.setProperty('--vk-cor', m.cor);
      const li = el('li', {}, a);
      return i === 0 && m.id === mae.id ? [li, el('li', { class: 'vk-sep', role: 'presentation' })] : [li];
    }).flat();

    const fechar = el('button', { class: 'vk-fechar', type: 'button', 'aria-label': 'Fechar' }, svg('<path d="M6 6l12 12M18 6 6 18"/>'));
    const painel = el('div', { class: 'vk-painel', id: 'vk-painel', role: 'dialog', 'aria-labelledby': 'vk-painel-titulo', tabindex: '-1' }, [
      el('div', { class: 'vk-painel-topo' }, [
        el('div', {}, [el('p', { class: 'vk-painel-kicker', texto: `Grupo ${mae.nome.split(' ')[0]}` }), el('h2', { class: 'vk-painel-titulo', id: 'vk-painel-titulo', texto: 'Conheça os nossos sites' })]),
        fechar,
      ]),
      el('ul', { class: 'vk-lista' }, itens),
      el('p', { class: 'vk-painel-nota', texto: `Cada marca é uma empresa ${mae.nome.split(' ')[0]}: mesmo time, mesmo cuidado.` }),
    ]);
    const fundo = el('div', { class: 'vk-fundo', 'aria-hidden': 'true' });
    const caixa = el('div', { class: 'vk-troca' }, [aba, fundo, painel]);
    document.body.append(caixa);

    let aberto = false;
    function abrir() {
      aberto = true; caixa.classList.add('vk-aberto'); aba.setAttribute('aria-expanded', 'true');
      const alvo = painel.querySelector('[aria-current="page"]') || painel.querySelector('.vk-item');
      setTimeout(() => (alvo || painel).focus({ preventScroll: true }), 60);
    }
    function fecharPainel(devolverFoco = true) {
      if (!aberto) return;
      aberto = false; caixa.classList.remove('vk-aberto'); aba.setAttribute('aria-expanded', 'false');
      if (devolverFoco) aba.focus({ preventScroll: true });
    }
    aba.addEventListener('click', () => (aberto ? fecharPainel() : abrir()));
    fechar.addEventListener('click', () => fecharPainel());
    fundo.addEventListener('click', () => fecharPainel(false));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && aberto) { e.preventDefault(); fecharPainel(); } });
    painel.addEventListener('focusout', e => { if (aberto && e.relatedTarget && !painel.contains(e.relatedTarget) && e.relatedTarget !== aba) fecharPainel(false); });
    raiz.classList.add('vk-com-troca');
  }
})();
