// Componentes visuais reaproveitados nas artes e nos vídeos.
// Todos os dados dos mockups são fictícios.
const LOGO_MARK = (id = 'g') => `<svg viewBox="0 0 128 128" fill="none"><defs><linearGradient id="${id}" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse"><stop stop-color="#b15cff"/><stop offset="1" stop-color="#7e22ce"/></linearGradient></defs><rect width="128" height="128" rx="34" fill="url(#${id})"/><path d="M33 36L64 94L95 36" stroke="#fff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/><circle cx="95" cy="36" r="10" fill="#f5b8ff"/></svg>`;
let _lg = 0;
const logo = (size = 34) => `<span class="logo" style="font-size:${size}px">${LOGO_MARK('lg' + (++_lg))}<span>Vorkeza<small>DIGITAL</small></span></span>`;
const CHECK = `<span class="check"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l5 5L19 7"/></svg></span>`;
const XMARK = `<span class="check xmark"><svg viewBox="0 0 24 24" fill="none" stroke="#f5b8ff" stroke-width="4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></span>`;
const ARROW = `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const WA = (c = '#fff') => `<svg viewBox="0 0 32 32" width="1.15em" height="1.15em" fill="none"><path d="M16 3.5A12.5 12.5 0 0 0 5.2 22.3L3.5 28.5l6.4-1.7A12.5 12.5 0 1 0 16 3.5Z" stroke="${c}" stroke-width="2.6" stroke-linejoin="round"/><path d="M11.6 9.8c-.9.4-1.8 1.7-1.5 3.4.7 4 5 8.3 9 8.9 1.7.3 3-.6 3.4-1.6.2-.5.2-1 .1-1.2l-3-1.5c-.3-.1-.5 0-.7.2l-1 1.2c-.2.2-.4.3-.7.1-1.7-.7-3.2-2.1-4.1-3.8-.1-.3 0-.5.2-.7l.9-1c.2-.2.2-.4.1-.7l-1.3-3c-.2-.4-.9-.5-1.4-.3Z" fill="${c}"/></svg>`;

const FOODS = {
  coxinha: `<svg viewBox="0 0 48 48"><path d="M24 5c5 9 15 17 15 27a15 12 0 0 1-30 0C9 22 19 14 24 5Z" fill="#b45309"/><path d="M15 31c1-6 5-11 9-16" stroke="#fde68a" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`,
  bolinha: `<svg viewBox="0 0 48 48"><circle cx="24" cy="25" r="17" fill="#c2410c"/><path d="M13 21a12 12 0 0 1 10-8" stroke="#fed7aa" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`,
  pastel: `<svg viewBox="0 0 48 48"><path d="M5 31a19 21 0 0 1 38 0c0 2-1 3-3 3H8c-2 0-3-1-3-3Z" fill="#d97706"/><path d="M9 31h30" stroke="#fde68a" stroke-width="3" stroke-dasharray="3 4" stroke-linecap="round"/></svg>`,
  kibe: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="25" rx="20" ry="12" transform="rotate(-18 24 25)" fill="#7c2d12"/><path d="M12 25c5-6 13-9 21-9" stroke="#fdba74" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`,
};
const ITEMS = [['coxinha', 'Cento de coxinha', 'R$ 89,00'], ['bolinha', 'Bolinha de queijo', 'R$ 79,00'], ['pastel', 'Pastel de carne', 'R$ 12,00'], ['kibe', 'Kibe recheado', 'R$ 9,00'], ['coxinha', 'Coxinha de costela', 'R$ 14,00'], ['bolinha', 'Risole de presunto', 'R$ 8,50'], ['pastel', 'Pastel de queijo', 'R$ 12,00'], ['kibe', 'Mini kibe (20 un.)', 'R$ 32,00']];

// a = opções de animação (só usadas nos vídeos)
const menuScreen = ({ at = null, cart = null, count = 2, total = 'R$ 168,00', listAttr = '' } = {}) => {
  const anim = i => at === null ? '' : `data-at="${(at + i * .09).toFixed(2)}" data-fx="right"`;
  return `<div class="scr"><div class="menu-head"><h4>Casa do Sabor</h4><div class="open">Loja aberta</div></div>
  <div class="search">Buscar no cardápio…</div><div class="pills"><span>Salgados</span><span>Porções</span><span>Doces</span><span>Bebidas</span></div>
  <div ${listAttr}>${ITEMS.map(([f, n, p], i) => `<div class="item" ${anim(i)}><div class="food">${FOODS[f]}</div><div><b>${n}</b><span>${p}</span></div><div class="plus">+</div></div>`).join('')}</div>
  ${cart === null ? '' : `<div class="cart" data-at="${cart}" data-fx="up" data-d=".45"><span><u>${count}</u></span><span>Ver carrinho</span><span>${total}</span></div>`}</div>`;
};

const whatsScreen = ({ at = null } = {}) => {
  const a = (d, fx = 'pop') => at === null ? '' : `data-at="${(at + d).toFixed(2)}" data-fx="${fx}"`;
  return `<div class="scr wa"><div class="wa-head"><i>C</i><div>Casa do Sabor<small>online</small></div></div>
  <div class="bubble" ${a(0)}><b>Novo pedido</b><hr>
  1x Cento de coxinha — R$ 89,00<br>1x Bolinha de queijo — R$ 79,00<hr>
  <b>Total: R$ 168,00</b><br>Entrega: Rua das Flores, 120<br>Pagamento: Pix<time>19:42 ✓✓</time></div>
  <div class="bubble in" ${a(.9)}>Pedido recebido! Sai em 40 minutos.<time>19:43</time></div>
  <div class="bubble" ${a(1.4)}>Pix enviado!<time>19:44 ✓✓</time></div><div class="bubble in" ${a(1.85)}>Confirmado. Obrigado pela preferência!<time>19:44</time></div><div class="bubble" ${a(2.3)}>Vocês são rápidos demais!<time>19:45 ✓✓</time></div></div>`;
};

const siteScreen = ({ name = 'Studio Bella', title = 'Sua melhor versão começa aqui.', at = null } = {}) => {
  const a = (d, fx = 'up') => at === null ? '' : `data-at="${(at + d).toFixed(2)}" data-fx="${fx}"`;
  return `<div class="scr"><div class="site-hero"><div class="kick">${name.toUpperCase()}</div><h3 ${a(.1)}>${title}</h3><span class="btn" ${a(.3, 'pop')}>Agendar agora ${ARROW}</span></div>
  <div class="site-cards">${[['Serviços', 'Veja tudo o que oferecemos'], ['Galeria', 'Fotos dos nossos trabalhos'], ['Onde estamos', 'Mapa e horários'], ['Fale conosco', 'WhatsApp em um toque']].map(([b, s], i) => `<div class="site-card" ${a(.45 + i * .1, 'right')}><i></i><div><b>${b}</b><span>${s}</span></div></div>`).join('')}</div></div>`;
};

const caixaScreen = ({ at = null } = {}) => {
  const a = (d, fx = 'up') => at === null ? '' : `data-at="${(at + d).toFixed(2)}" data-fx="${fx}"`;
  const num = (v, d) => at === null ? v.toLocaleString('pt-BR') : `<span data-count="${v}" data-at="${(at + d).toFixed(2)}" data-d="1.3" data-fx="none">0</span>`;
  const row = (l, v, w, d) => `<div class="cx-row" ${a(d)}><div><span>${l}</span><span>R$ ${num(v, d)}</span></div><u style="width:${w}%" ${at === null ? '' : `data-at="${(at + d + .1).toFixed(2)}" data-fx="growx" data-d="1.2"`}></u></div>`;
  return `<div class="scr cx"><div class="cx-head"><h4>Caixa de hoje</h4><div class="open">Caixa aberto</div><span class="demo-tag">EXEMPLO</span></div>
  <div class="cx-tot" ${a(0, 'pop')}><small>Total recebido</small><b>R$ ${num(2840, .1)}</b></div>
  ${row('Dinheiro', 620, 26, .25)}${row('Cartão', 980, 42, .4)}${row('Pix', 1240, 54, .55)}
  <div class="cx-note" ${a(1)}>Esperado na gaveta: R$ 770 (troco inicial de R$ 150 + dinheiro)</div></div>`;
};

const phone = (inner, zoom = 1, extra = '') => `<div style="zoom:${zoom}" ${extra}><div class="phone"><div class="notch"></div><div class="screen">${inner}</div></div></div>`;
const browser = (inner, url = 'suaempresa.com.br', zoom = 1, extra = '') => `<div style="zoom:${zoom}" ${extra}><div class="browser"><div class="bar"><i></i><i></i><i></i><b>${url}</b></div><div style="flex:1;position:relative;overflow:hidden">${inner}</div></div></div>`;

const desktopSite = (extra = {}) => `<div style="display:flex;height:100%"><div style="flex:1.25;background:linear-gradient(150deg,#2a0f4d,#7e22ce 80%,#c026d3);color:#fff;padding:42px 36px;display:flex;flex-direction:column;justify-content:center"><div style="font:700 12px 'DM Sans';letter-spacing:.2em;color:#f5b8ff">${extra.kick || 'NORTE ENGENHARIA'}</div><h3 style="font-size:46px;margin:12px 0 22px">${extra.title || 'Compromisso com cada detalhe.'}</h3><span class="btn" style="font-size:16px;align-self:flex-start">Pedir proposta ${ARROW}</span></div><div style="flex:1;padding:22px;display:flex;flex-direction:column;gap:11px;justify-content:center">${['Início', 'Sobre nós', 'Serviços', 'Galeria', 'Contato'].map((t, i) => `<div class="site-card" style="padding:9px 12px"><i style="width:34px;height:34px"></i><b style="font-size:15px">${t}</b></div>`).join('')}</div></div>`;

const PLANS = [
  ['Site Express', '790', 'Uma página profissional para ser encontrado.'],
  ['Site Profissional', '1.390', 'Até 5 páginas para gerar confiança.'],
  ['Cardápio Delivery', '1.490', 'Até 40 produtos e pedido no WhatsApp.'],
  ['Cardápio Completo', '2.390', 'Até 150 produtos, busca e combos.'],
];
const FINE = '*Valores iniciais, confirmados na proposta. Domínio pago pelo cliente. Hospedagem por 12 meses, dentro dos limites da proposta.';
