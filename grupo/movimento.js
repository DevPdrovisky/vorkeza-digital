/* Grupo Vorkeza — animações compartilhadas pelos sites do grupo (Vorkeza, Vitrine Motor, Vitrine Imóvel).
   Tudo é opcional, funciona sem biblioteca e respeita "reduzir movimento" do aparelho.
   Uso: <link rel="stylesheet" href="grupo/movimento.css">
        <script src="grupo/movimento.js" data-texto="h1, main h2" data-brilho=".rec, .plano" data-ima=".btn-grande" defer></script>

   Efeitos (ligados por atributo no HTML ou pelas listas no <script>):
   - data-texto="seletor"   títulos entram palavra por palavra, saindo do desfoque
   - [data-m-rolagem]       frase grande que vai "acendendo" palavra por palavra conforme a rolagem
   - data-brilho="seletor"  cartões com luz que segue o mouse e borda acesa
   - data-ima="seletor"     botões que puxam levemente para o mouse
   - [data-m-tilt]          cartão que inclina na direção do mouse, com reflexo
   - [data-m-parallax]      filhos com data-prof="0.5" se deslocam com o mouse (profundidade)
   - .m-seta                seta que troca com desfoque e escala ao passar o mouse
   - .m-troca               troca de ícone/texto (.m-a -> .m-b) quando ganha .is-on
   - [data-m-conta]         número que conta até o valor quando aparece
   - [data-m-digita]        balão de mensagem: "digitando..." vira o texto (troca .is-on)
   - botões .m-faisca       faíscas no clique */
(() => {
  'use strict';
  const script = document.currentScript;
  const opt = (script && script.dataset) || {};
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fino = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $$ = (s, r = document) => (s ? [...r.querySelectorAll(s)] : []);
  const raiz = document.documentElement;
  raiz.classList.add('m-js');
  if (quieto) raiz.classList.add('m-quieto');

  const SETA = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M9 7h8v8"/></svg>';

  /* Observador único: adiciona .m-in quando o elemento aparece na tela */
  const quandoVisivel = (() => {
    if (!('IntersectionObserver' in window)) return (el, fn) => fn(el);
    const fns = new WeakMap();
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const fn = fns.get(e.target); if (fn) fn(e.target);
    }), { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    return (el, fn) => { fns.set(el, fn); io.observe(el); };
  })();

  /* ---------- Divide um título em palavras, sem perder <em>, <span>, <br> ---------- */
  function dividir(el, classe) {
    let i = 0;
    const unidade = node => { // elementos com texto em degradê animam inteiros (o degradê some se dividir)
      const cs = getComputedStyle(node);
      return (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text');
    };
    const andar = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const partes = n.textContent.split(/(\s+)/);
          if (partes.every(p => !p.trim())) return;
          const frag = document.createDocumentFragment();
          partes.forEach(p => {
            if (!p) return;
            if (!p.trim()) { frag.append(document.createTextNode(p)); return; }
            const s = document.createElement('m-p'); // tag própria: não herda estilos de "h2 span" dos sites
            s.className = classe; s.style.setProperty('--i', i++); s.textContent = p;
            frag.append(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && n.tagName !== 'SVG' && n.tagName !== 'svg') {
          if (unidade(n)) {
            n.classList.add(classe); n.style.setProperty('--i', i++);
            if (getComputedStyle(n).display === 'inline') n.style.display = 'inline-block';
          } else andar(n);
        }
      });
    };
    andar(el);
    return i;
  }

  /* ---------- Títulos que saem do desfoque ---------- */
  if (!quieto) $$(opt.texto).forEach(el => {
    if (el.closest('[data-m-rolagem]') || el.dataset.mFeito) return;
    el.dataset.mFeito = '1';
    const n = dividir(el, 'm-w');
    el.style.setProperty('--n', n);
    el.classList.add('m-texto');
    quandoVisivel(el, t => t.classList.add('m-in'));
  });

  /* ---------- Frase que acende com a rolagem ---------- */
  const rolagens = quieto ? [] : $$('[data-m-rolagem]').map(el => {
    const n = dividir(el, 'm-r');
    el.classList.add('m-rolagem');
    return { el, n, palavras: $$('.m-r', el), ultimo: -1 };
  });
  if (rolagens.length) {
    let pedido = false;
    const atualizar = () => {
      pedido = false;
      const vh = innerHeight;
      rolagens.forEach(r => {
        const b = r.el.getBoundingClientRect();
        // começa quando o topo passa de 88% da tela e termina quando o fim passa de 45%
        const ini = vh * 0.88, fim = vh * 0.45;
        const p = Math.min(1, Math.max(0, (ini - b.top) / (ini - fim + b.height * 0.6)));
        const ate = Math.round(p * r.palavras.length);
        if (ate === r.ultimo) return;
        r.ultimo = ate;
        r.palavras.forEach((w, k) => w.classList.toggle('on', k < ate));
      });
    };
    addEventListener('scroll', () => { if (!pedido) { pedido = true; requestAnimationFrame(atualizar); } }, { passive: true });
    addEventListener('resize', atualizar);
    atualizar();
  }

  /* ---------- Luz que segue o mouse nos cartões ---------- */
  $$(opt.brilho).concat($$('[data-m-brilho]')).forEach(card => {
    card.classList.add('m-brilho');
    if (!fino) return;
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Botões-ímã ---------- */
  if (fino && !quieto) $$(opt.ima).concat($$('[data-m-ima]')).forEach(b => {
    b.classList.add('m-ima');
    const forca = 0.22, max = 8;
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      const x = Math.max(-max, Math.min(max, (e.clientX - r.left - r.width / 2) * forca));
      const y = Math.max(-max, Math.min(max, (e.clientY - r.top - r.height / 2) * forca));
      b.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    });
    b.addEventListener('pointerleave', () => { b.style.translate = ''; });
  });

  /* ---------- Cartão que inclina, com reflexo ---------- */
  if (fino && !quieto) $$('[data-m-tilt]').forEach(c => {
    const graus = Number(c.dataset.mTilt) || 7;
    c.classList.add('m-tilt');
    if (!c.querySelector(':scope > .m-reflexo')) c.insertAdjacentHTML('beforeend', '<span class="m-reflexo" aria-hidden="true"></span>');
    if (getComputedStyle(c).position === 'static') c.style.position = 'relative';
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty('--ry', ((x - 0.5) * graus * 2).toFixed(2) + 'deg');
      c.style.setProperty('--rx', ((0.5 - y) * graus * 2).toFixed(2) + 'deg');
      c.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
      c.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      c.classList.add('m-tilt-on');
    });
    c.addEventListener('pointerleave', () => {
      c.classList.remove('m-tilt-on');
      c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg');
    });
  });

  /* ---------- Profundidade com o mouse ---------- */
  if (fino && !quieto) $$('[data-m-parallax]').forEach(box => {
    const zona = box.closest('section') || box;
    const filhos = $$('[data-prof]', box);
    zona.addEventListener('pointermove', e => {
      const r = box.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / r.width, y = (e.clientY - (r.top + r.height / 2)) / r.height;
      filhos.forEach(f => { const p = Number(f.dataset.prof) * 34; f.style.translate = `${(x * p).toFixed(1)}px ${(y * p).toFixed(1)}px`; });
    });
    zona.addEventListener('pointerleave', () => filhos.forEach(f => { f.style.translate = ''; }));
  });

  /* ---------- Seta com troca (desfoque + escala) ---------- */
  $$('.m-seta').forEach(s => { if (!s.childElementCount) s.innerHTML = `<span class="m-a">${SETA}</span><span class="m-b">${SETA}</span>`; });

  /* ---------- Números que contam ---------- */
  $$('[data-m-conta]').forEach(el => {
    const txt = el.textContent;
    const m = txt.match(/\d[\d.]*/);
    if (!m) return;
    const alvo = Number(m[0].replace(/\./g, ''));
    const antes = txt.slice(0, m.index), depois = txt.slice(m.index + m[0].length);
    const fmt = v => antes + Math.round(v).toLocaleString('pt-BR') + depois;
    if (quieto) return;
    el.style.minWidth = el.offsetWidth + 'px'; // não pula de largura enquanto conta
    el.textContent = fmt(0);
    quandoVisivel(el, () => {
      const t0 = performance.now(), dur = 1100;
      const passo = t => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(alvo * e);
        if (p < 1) requestAnimationFrame(passo); else el.style.minWidth = '';
      };
      requestAnimationFrame(passo);
    });
  });

  /* ---------- Balão "digitando..." ---------- */
  $$('[data-m-digita]').forEach(el => {
    if (quieto) { el.classList.add('is-on'); return; }
    const espera = Number(el.dataset.mDigita) || 1600;
    quandoVisivel(el, () => setTimeout(() => el.classList.add('is-on'), espera));
  });

  /* ---------- Faíscas no clique ---------- */
  if (!quieto) document.addEventListener('click', e => {
    const b = e.target.closest('.m-faisca');
    if (!b || !e.clientX) return;
    const cor = getComputedStyle(b).getPropertyValue('--m-faisca').trim() || getComputedStyle(b).backgroundColor;
    const NS = 'http://www.w3.org/2000/svg';
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('class', 'm-faiscas'); s.setAttribute('viewBox', '-50 -50 100 100'); s.setAttribute('aria-hidden', 'true');
    s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px'; s.style.color = cor;
    for (let k = 0; k < 8; k++) {
      const l = document.createElementNS(NS, 'line');
      const a = (k / 8) * Math.PI * 2;
      l.setAttribute('x1', (Math.cos(a) * 14).toFixed(1)); l.setAttribute('y1', (Math.sin(a) * 14).toFixed(1));
      l.setAttribute('x2', (Math.cos(a) * 26).toFixed(1)); l.setAttribute('y2', (Math.sin(a) * 26).toFixed(1));
      s.append(l);
    }
    document.body.append(s);
    setTimeout(() => s.remove(), 600);
  });
})();
