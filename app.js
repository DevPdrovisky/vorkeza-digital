(function () {
  'use strict';
  var config = window.AGENCY_CONFIG || {};
  var brand = config.brandName || 'VORKEZA DIGITAL';
  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var waNumber = String(config.whatsappNumber || '').replace(/\D/g, '');
  var hasWhatsApp = waNumber.length >= 12 && waNumber.length <= 15;
  var waLink = function (text) { return 'https://wa.me/' + waNumber + (text ? '?text=' + encodeURIComponent(text) : ''); };

  /* ---------- Ano no rodapé ---------- */
  $('#currentYear').textContent = String(new Date().getFullYear());

  /* ---------- Menu mobile ---------- */
  var header = $('#siteHeader');
  var navToggle = $('#menuToggle');
  var navLinks = $('#navLinks');
  function setMenu(open) {
    navLinks.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  navToggle.addEventListener('click', function () { setMenu(!navLinks.classList.contains('is-open')); });
  $$('a', navLinks).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) setMenu(false); });

  /* ---------- Header, barra de progresso, botões flutuantes ---------- */
  var progress = $('#scrollProgress');
  var toTop = $('#toTop');
  var mobileBar = $('#mobileBar');
  var hero = $('.hero');
  var contact = $('#orcamento');
  var contactVisible = false;
  var ticking = false;
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', y > 24);
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    var pastHero = y > hero.offsetHeight - 120;
    toTop.classList.toggle('is-visible', pastHero);
    mobileBar.classList.toggle('is-visible', pastHero && !contactVisible);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); } }, { passive: true });
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });

  /* ---------- Animações de entrada + link ativo ---------- */
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); revealObs.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(function (el) { revealObs.observe(el); });

    var navMap = {};
    $$('.nav-links > a:not(.btn)').forEach(function (a) { navMap[a.getAttribute('href').slice(1)] = a; });
    var sectionNav = $('#sectionNav');
    function markSection(id) { // barra de seções do celular: destaca a atual e a mantém visível
      $$('a', sectionNav).forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('is-active', on);
        if (on) sectionNav.scrollTo({ left: a.offsetLeft - (sectionNav.clientWidth - a.offsetWidth) / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) markSection(entry.target.id);
        var link = navMap[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          $$('.nav-links > a.is-active').forEach(function (a) { a.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
      onScroll();
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { sectionObs.observe(s); });
    // a barra fixa some quando o formulário está na tela
    new IntersectionObserver(function (entries) {
      contactVisible = entries[0].isIntersecting; onScroll();
    }, { threshold: 0.05 }).observe(contact);
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }
  onScroll();

  /* ---------- Vitrine do hero: escala proporcional + inclinação com o mouse ---------- */
  var showcase = $('#showcase');
  var stage = $('#showcaseStage');
  function fitStage() { stage.style.setProperty('--stage-scale', String(showcase.clientWidth / 600)); }
  fitStage();
  if ('ResizeObserver' in window) new ResizeObserver(fitStage).observe(showcase);
  else window.addEventListener('resize', fitStage);
  if (finePointer && !reduceMotion) {
    hero.addEventListener('pointermove', function (e) {
      var r = showcase.getBoundingClientRect();
      var x = (e.clientX - (r.left + r.width / 2)) / r.width;
      var y = (e.clientY - (r.top + r.height / 2)) / r.height;
      stage.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
      stage.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg');
    });
    hero.addEventListener('pointerleave', function () { stage.style.setProperty('--ry', '0deg'); stage.style.setProperty('--rx', '0deg'); });
  }

  /* ---------- Palavra rotativa do hero ---------- */
  var words = ['barbearias', 'restaurantes', 'clínicas', 'salões de beleza', 'lojas', 'oficinas', 'pequenos negócios'];
  var rotator = $('#rotator');
  if (rotator && !reduceMotion) {
    // Com a aba em segundo plano o navegador atrasa os timers; por isso cada troca
    // limpa tudo e deixa só UMA palavra, e nada roda enquanto a aba está escondida.
    var idx = 0, trocando = false, timer = null;
    var soUma = function (texto) {
      $$('.rotator-word', rotator).forEach(function (w) { w.remove(); });
      var w = document.createElement('span');
      w.className = 'rotator-word';
      w.textContent = texto;
      rotator.appendChild(w);
      rotator.style.width = '';
      return w;
    };
    var trocar = function () {
      if (document.hidden || trocando) return;
      trocando = true;
      var current = $('.rotator-word', rotator);
      idx = (idx + 1) % words.length;
      var startW = rotator.offsetWidth;
      if (current) current.classList.add('is-out');
      setTimeout(function () {
        var next = soUma(words[idx]);
        next.classList.add('is-in');
        var endW = rotator.offsetWidth;
        rotator.style.width = startW + 'px';
        void rotator.offsetWidth;
        rotator.style.width = endW + 'px';
        setTimeout(function () { rotator.style.width = ''; trocando = false; }, 450);
      }, 300);
    };
    var liga = function () { clearInterval(timer); timer = setInterval(trocar, 2400); };
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { clearInterval(timer); return; }
      trocando = false;
      soUma(words[idx]);
      liga();
    });
    liga();
  }

  /* ---------- Efeito "spotlight" nos cartões ---------- */
  if (finePointer) {
    $$('.spotlight').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- FAQ com abertura suave ---------- */
  $$('.faq-list details').forEach(function (d) {
    var summary = $('summary', d);
    var body = $('.faq-body', d);
    summary.addEventListener('click', function (e) {
      if (reduceMotion || !body.animate) return;
      e.preventDefault();
      if (d.open) {
        var a = body.animate([{ height: body.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 300, easing: 'cubic-bezier(.2,.7,.2,1)' });
        a.onfinish = function () { d.open = false; };
      } else {
        // fecha os outros para manter a lista organizada
        $$('.faq-list details[open]').forEach(function (o) { if (o !== d) o.open = false; });
        d.open = true;
        var h = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' });
      }
    });
  });

  /* ---------- Preços: contagem animada e chave do painel ---------- */
  var nf = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
  var brl = function (v) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v); };
  function countTo(el, to) {
    var from = Number(el.dataset.value || 0);
    el.dataset.value = to;
    if (reduceMotion) { el.textContent = nf.format(to); return; }
    var start = null, dur = 900;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = nf.format(Math.round(from + (to - from) * eased));
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  var priceGrid = $('.pricing-grid');
  var priceCards = $$('.price-card');
  function renderPrices() {
    priceCards.forEach(function (card) { countTo($('.price-num', card), Number(card.dataset.base)); });
  }
  if ('IntersectionObserver' in window) {
    var counted = false;
    new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting && !counted) { counted = true; renderPrices(); obs.disconnect(); }
    }, { threshold: 0.3 }).observe(priceGrid);
  }

  /* ---------- Formulário de orçamento ---------- */
  var PAINEL_MES = 79;
  var planPricing = {
    'Site Express — R$ 790': { base: 790, prazo: 7 },
    'Site Profissional — R$ 1.390': { base: 1390, prazo: 10 },
    'Cardápio Delivery — R$ 1.490': { base: 1490, prazo: 10 },
    'Delivery Pro — R$ 2.390': { base: 2390, prazo: 15 }
  };
  function refreshEstimate() {
    var selected = $('#plan').value;
    var wantsPanel = $('#panelAddon').checked;
    var values = planPricing[selected];
    if (!values) {
      $('#estimate').textContent = selected ? 'Projeto sob orçamento. O painel mensal pode ser incluído depois de definirmos o escopo.' : 'Selecione um plano para conferir o investimento inicial.';
      return;
    }
    var site = brl(values.base) + ' pelo site (' + brl(values.base / 2) + ' para começar e ' + brl(values.base / 2) + ' na entrega), pronto em até ' + values.prazo + ' dias úteis.';
    $('#estimate').textContent = wantsPanel
      ? site + ' Painel: ' + brl(PAINEL_MES) + '/mês a partir de quando entrar no ar, com hospedagem e domínio inclusos.'
      : site + ' Hospedagem e domínio do 1º ano inclusos.';
  }
  $$('.choose-plan').forEach(function (a) {
    a.addEventListener('click', function () {
      $('#plan').value = a.dataset.plan;
      refreshEstimate();
    });
  });
  $('#chooseCms').addEventListener('click', function () { $('#panelAddon').checked = true; refreshEstimate(); });
  $('#chooseGestao').addEventListener('click', function () {
    $('#plan').value = 'Projeto personalizado — sob orçamento';
    var details = $('#details');
    if (!details.value.trim()) details.value = 'Tenho interesse no Painel Completo (pedidos, caixa, despesas e equipe).';
    refreshEstimate();
  });
  $('#plan').addEventListener('change', refreshEstimate);
  $('#panelAddon').addEventListener('change', refreshEstimate);
  refreshEstimate();

  var form = $('#quoteForm');
  var feedback = $('#formFeedback');
  var copyBtn = $('#copyQuote');
  var waBtn = $('#whatsappQuote');
  var preview = $('#quotePreview');
  var textEl = $('#quoteText');
  var activeMessage = '';
  var required = ['fullName', 'businessName', 'sector', 'city', 'plan'];

  if (hasWhatsApp) {
    $('#formSubtitle').textContent = 'Preencha as informações. Ao preparar o orçamento, abriremos nosso WhatsApp com sua mensagem pronta.';
  } else {
    $('#stepThree').textContent = 'Você copia e envia para nós';
  }

  function setFeedback(msg, isError) { feedback.textContent = msg; feedback.classList.toggle('is-error', !!isError); }
  function validate() {
    var firstBad = null;
    required.forEach(function (id) {
      var input = $('#' + id);
      if (!input.value.trim()) { input.setAttribute('aria-invalid', 'true'); if (!firstBad) firstBad = input; }
      else input.removeAttribute('aria-invalid');
    });
    if (firstBad) {
      firstBad.focus({ preventScroll: true });
      firstBad.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      setFeedback('Preencha os campos obrigatórios (*) para preparar a mensagem.', true);
      return false;
    }
    return true;
  }
  form.addEventListener('input', function (e) { if (e.target.matches('input,select,textarea')) e.target.removeAttribute('aria-invalid'); });
  form.addEventListener('change', function (e) { if (e.target.matches('select')) e.target.removeAttribute('aria-invalid'); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = String(v); });
    var panel = data.panelAddon === 'sim';
    var lines = [
      'Olá, ' + brand + '! Quero solicitar um orçamento.', '',
      'Nome: ' + data.fullName.trim(),
      'Empresa: ' + data.businessName.trim(),
      'Segmento: ' + data.sector,
      'Cidade: ' + data.city.trim(),
      'Serviço de interesse: ' + data.plan,
      planPricing[data.plan] ? 'Investimento no site: ' + brl(planPricing[data.plan].base) + ' (50% para começar, 50% na entrega)' : null,
      'Painel de edição mensal: ' + (panel ? 'SIM (R$ 79/mês)' : 'NÃO'),
      (data.phone || '').trim() ? 'Meu WhatsApp: ' + data.phone.trim() : null,
      (data.details || '').trim() ? 'Detalhes: ' + data.details.trim() : null,
      '', 'Gostaria de saber os próximos passos.'
    ].filter(function (l) { return l !== null; });
    activeMessage = lines.join('\n');
    textEl.textContent = activeMessage;
    preview.hidden = false;
    copyBtn.hidden = false;
    if (hasWhatsApp) {
      var url = waLink(activeMessage);
      waBtn.href = url;
      waBtn.hidden = false;
      // abre o WhatsApp direto com a mensagem pronta; se o navegador bloquear, o botão fica como alternativa
      // sempre em nova aba: o WhatsApp não pode ser carregado dentro de outra página
      var win = null;
      try { win = window.open(url, '_blank'); } catch (_) { win = null; }
      if (win) {
        try { win.opener = null; } catch (_) {}
        setFeedback('Abrindo o WhatsApp com sua mensagem pronta… Se não abrir, toque em "Enviar pelo WhatsApp".');
      } else {
        setFeedback('Mensagem pronta! Toque em "Enviar pelo WhatsApp" para enviar para a gente.');
      }
    } else {
      waBtn.hidden = true;
      setFeedback('Mensagem pronta! Copie o texto abaixo e envie para nós. Este formulário não envia nem armazena seus dados.');
    }
    feedback.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  });

  copyBtn.addEventListener('click', function () {
    if (!activeMessage) return;
    function done() {
      copyBtn.textContent = 'Copiado ✓';
      setFeedback('Mensagem copiada. Você pode colá-la onde preferir.');
      setTimeout(function () { copyBtn.textContent = 'Copiar mensagem'; }, 2500);
    }
    function fallback() {
      // método alternativo (Safari antigo / páginas sem HTTPS)
      var temp = document.createElement('textarea');
      temp.value = activeMessage;
      temp.setAttribute('readonly', '');
      temp.style.position = 'fixed'; temp.style.top = '0'; temp.style.opacity = '0'; temp.style.fontSize = '16px';
      document.body.appendChild(temp);
      temp.focus(); temp.select(); temp.setSelectionRange(0, temp.value.length);
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
      temp.remove();
      if (ok) done(); else setFeedback('Não foi possível copiar automaticamente. Selecione o texto da mensagem abaixo e copie manualmente.', true);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(activeMessage).then(done, fallback);
    else fallback();
  });

  /* ---------- WhatsApp e redes (só aparecem se configurados) ---------- */
  if (hasWhatsApp) {
    var hello = 'Olá, ' + brand + '! Vim pelo site e quero saber mais sobre os planos.';
    [$('#waFloat'), $('#mobileBarWa')].forEach(function (el) { el.href = waLink(hello); el.hidden = false; });
  }
  var social = $('#footerSocial');
  if (hasWhatsApp) social.insertAdjacentHTML('beforeend', '<a href="' + waLink('') + '" target="_blank" rel="noopener noreferrer">WhatsApp</a>');
  if (config.instagramUrl) {
    var ig = document.createElement('a'); ig.href = config.instagramUrl; ig.target = '_blank'; ig.rel = 'noopener noreferrer'; ig.textContent = 'Instagram'; social.appendChild(ig);
    $$('[data-instagram]').forEach(function (el) { el.href = config.instagramUrl; el.hidden = false; });
  }
  if (config.email) {
    var em = document.createElement('a'); em.href = 'mailto:' + config.email; em.textContent = 'E-mail'; social.appendChild(em);
  }
})();

/* Faixa "No ar": digita o endereço, carrega e mostra um diferencial por vez.
   Usa um único ciclo encadeado; com a aba escondida, para e recomeça limpo ao voltar. */
(function () {
  'use strict';
  var lista = document.getElementById('nnLista');
  if (!lista) return;
  var itens = Array.prototype.slice.call(lista.querySelectorAll('li'));
  var pontos = Array.prototype.slice.call(document.querySelectorAll('#nnPontos i'));
  var url = document.getElementById('nnUrl');
  var status = document.getElementById('nnStatus');
  var carrega = document.getElementById('nnCarrega');
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var idx = 0, timers = [], rodando = false;

  var espera = function (fn, ms) { timers.push(setTimeout(fn, ms)); };
  var limpa = function () { timers.forEach(clearTimeout); timers = []; };
  var mostra = function (i) {
    itens.forEach(function (li, k) { li.classList.toggle('on', k === i); li.classList.remove('sai'); });
    pontos.forEach(function (p, k) { p.classList.toggle('on', k === i); });
  };

  if (quieto) { mostra(0); status.classList.add('on'); return; }

  var ciclo = function () {
    if (document.hidden) { rodando = false; return; }
    rodando = true;
    var alvo = itens[idx].getAttribute('data-url');
    var atual = itens.filter(function (li) { return li.classList.contains('on'); })[0];
    if (atual) atual.classList.add('sai');
    status.classList.remove('on');
    carrega.classList.remove('on', 'fim');
    url.textContent = '';
    var k = 0;
    var digita = function () {
      if (k <= alvo.length) { url.textContent = alvo.slice(0, k); k++; espera(digita, 42); return; }
      void carrega.offsetWidth;
      carrega.classList.add('on');
      espera(function () {
        carrega.classList.add('fim');
        status.classList.add('on');
        mostra(idx);
        idx = (idx + 1) % itens.length;
        espera(ciclo, 2600);
      }, 900);
    };
    espera(digita, 250);
  };

  document.addEventListener('visibilitychange', function () {
    limpa();
    if (document.hidden) { rodando = false; return; }
    if (!rodando) ciclo();
  });

  var obs = new IntersectionObserver(function (e) {
    if (e[0].isIntersecting && !rodando) { obs.disconnect(); ciclo(); }
  });
  obs.observe(lista);
})();
