// Roteiros. Cada cena: [duração em segundos, estilo de fundo, HTML].
// Durações em múltiplos de 0,5 s para os cortes caírem na batida (120 BPM).
// data-at = quando entra (segundos dentro da cena) | data-fx = efeito.
const H = (t, at = .05, size) => `<h1 data-split data-at="${at}"${size ? ` style="font-size:${size}px"` : ''}>${t}</h1>`;
const SUB = (t, at = .7) => `<p class="sub" data-at="${at}" data-fx="up">${t}</p>`;
const TAG = (t, at = 0) => `<div class="tag" data-at="${at}" data-fx="left">${t}</div>`;
const FEAT = (t, at) => `<div class="feat" data-at="${at}" data-fx="right" data-d=".5">${CHECK}<span>${t}</span></div>`;
const FEATS = (list, at = .6) => `<div class="feats">${list.map((t, i) => FEAT(t, at + i * .22)).join('')}</div>`;
const PRICE = (v, at = 1, prefix = '') => `<div class="price" data-at="${at}" data-fx="pop" data-beat>${prefix}<small>R$</small><span data-count="${v}" data-at="${at}" data-fx="none" data-d=".9">0</span><small>*</small></div>`;
const VFINE = t => `<div class="vfine" data-at=".3" data-fx="up">${t}</div>`;
const F1 = '*Valores iniciais, confirmados na proposta. Domínio pago pelo cliente.';
const ring = (s, x, y, rot = 14) => `<div class="ring" style="width:${s}px;height:${s}px;left:${x}px;top:${y}px" data-at="0" data-fx="pop" data-rot="${rot}"></div>`;

const CTA = (a, b) => [3.5, 'vivid center', `
  ${ring(980, 50, 410)}${ring(720, 180, 540, -20)}
  <div class="light" style="background:#fff;padding:26px 44px;border-radius:36px;box-shadow:0 30px 60px -16px #0008" data-at="0" data-fx="spin" data-d=".7" data-beat>${logo(84)}</div>
  <div style="height:56px"></div>
  ${H(a, .25, 112)}
  <p class="sub" data-at=".95" data-fx="up" style="color:#fff">${b}</p>
  <div style="margin-top:50px" data-at="1.25" data-fx="pop" data-beat><span class="btn white" style="font-size:58px">${WA('#9333ea')} (DDD) NUMERO</span></div>
  <div class="m" style="font-size:66px;margin-top:44px" data-at="1.55" data-fx="up">vorkeza.com.br</div>`];

const plan = (cls, num, a, b, phoneHtml, feats, price) => [3.5, cls, `
  ${TAG(num)}${H(`${a}<br><em>${b}</em>`, .05, 124)}
  <div class="cols"><div data-at=".2" data-fx="left" data-float="9">${phone(phoneHtml, .72)}</div>${FEATS(feats, .55)}</div>
  ${PRICE(price, 1.25)}${VFINE(F1)}`];

const VIDEOS = {
  1: {
    file: 'video-1-todos-os-servicos', scenes: [
      [2.5, '', `${H('Seu negócio<br>é bom.', .1, 168)}`],
      [2.5, 'vivid', `${H('Seu site precisa <em>mostrar isso.</em>', .05, 150)}`],
      [2, 'light center', `<div data-at="0" data-fx="spin" data-d=".6">${logo(96)}</div><div style="height:50px"></div>${H('Tem um plano <em>para você.</em>', .3, 118)}`],
      plan('', '01', 'Site', 'Express', siteScreen({ at: .4 }), ['1 página', 'WhatsApp e endereço', 'Celular e computador'], 790),
      [3.5, 'light', `${TAG('02')}${H('Site<br><em>Profissional</em>', .05, 124)}
        <div style="margin-top:36px" data-at=".25" data-fx="zoom" data-d=".7">${browser(desktopSite(), 'suaempresa.com.br', 1.19)}</div>
        <div style="display:flex;gap:16px;margin-top:30px;font-size:36px;font-weight:700"><span class="chip" style="background:#fff;color:var(--v);border-color:var(--line)" data-at=".9" data-fx="pop">Até 5 páginas</span><span class="chip" style="background:#fff;color:var(--v);border-color:var(--line)" data-at="1.05" data-fx="pop">Galeria e serviços</span></div>
        ${PRICE(1390, 1.3)}${VFINE(F1)}`],
      plan('', '03', 'Cardápio', 'Delivery', menuScreen({ at: .4 }), ['Até 40 produtos', 'Carrinho', 'Pedido no WhatsApp'], 1490),
      plan('vivid', '04', 'Cardápio', 'Completo', menuScreen({ at: .4 }), ['Até 150 produtos', 'Busca e filtros', 'Combos e destaques'], 2390),
      [2.5, 'light', `${TAG('+ adicional')}${H('Painel <em>Simples</em>', .05, 134)}${SUB('Você mesmo troca fotos, textos e preços.', .6)}
        <div class="stamp" style="background:var(--v);color:#fff" data-at="1.1" data-fx="pop">Sem depender da agência</div>`],
      [3, '', `${TAG('+ gestão')}${H('Painel <em>Completo</em>', .05, 134)}
        <div class="feats" style="margin-top:44px">${['Abre e fecha o caixa', 'Pedidos', 'Despesas', 'Equipe'].map((t, i) => FEAT(t, .55 + i * .2)).join('')}</div>`],
      CTA('Escolha o seu e peça seu orçamento.', 'Preço fechado, sem enrolação.'),
    ]
  },
  2: {
    file: 'video-2-como-funciona', scenes: [
      [2.5, 'vivid', `${H('Quanto custa <em>um site?</em>', .1, 164)}`],
      [2.5, '', `${H('Aqui você sabe <em>antes de começar.</em>', .05, 134)}`],
      [3, 'light', `${TAG('Preço fechado')}
        ${PLANS.map(([n, p], i) => `<div class="feat" style="justify-content:space-between;margin-top:20px;font-size:50px;padding:34px 34px" data-at="${.2 + i * .2}" data-fx="right"><span>${n}</span><span style="color:var(--v)">R$ ${p}*</span></div>`).join('')}
        ${VFINE(F1)}`],
      [3.5, '', `<div class="step" data-at="0" data-fx="zoom">1</div>${H('Uma <em>conversa.</em>', .05, 138)}${SUB('Você conta o que precisa e manda logo, fotos e referências.', .55)}
        <div style="margin-top:44px;font-size:40px"><div class="bubble in" style="margin:0 120px 0 0;font-size:44px;padding:28px 34px;border-radius:10px 36px 36px 36px" data-at="1" data-fx="pop">Quero um site para o meu salão!</div><div class="bubble" style="margin:24px 0 0 120px;font-size:44px;padding:28px 34px;border-radius:36px 10px 36px 36px" data-at="1.7" data-fx="pop">Bora! Me manda seu logo.</div></div>`],
      [3.5, 'vivid', `<div class="step" style="-webkit-text-stroke-color:#fff" data-at="0" data-fx="zoom">2</div>${H('Seu <em>visual.</em>', .05, 138)}${SUB('Cores, textos e imagens com a cara da sua marca.', .5)}
        <div style="display:flex;gap:26px;margin-top:44px;align-items:center"><div data-at=".5" data-fx="up" data-float="9">${phone(siteScreen({ at: .7, name: 'Salão Aurora' }), .62)}</div>
        <div style="display:flex;flex-direction:column;gap:20px;flex:1">${['#7e22ce', '#ec4899', '#f5b8ff', '#1e0d38'].map((c, i) => `<div style="height:78px;border-radius:20px;background:${c};border:3px solid #fff8;transform-origin:left" data-at="${.9 + i * .16}" data-fx="growx" data-d=".5"></div>`).join('')}</div></div>`],
      [3, 'light', `<div class="step" style="-webkit-text-stroke-color:#9333ea" data-at="0" data-fx="zoom">3</div>${H('Revisão <em>juntos.</em>', .05, 138)}${SUB('Você confere tudo antes de publicar.', .5)}
        <div class="stamp" style="background:var(--v);color:#fff" data-at="1" data-fx="pop" data-beat>2 rodadas de ajustes</div>`],
      [3, '', `<div class="step" data-at="0" data-fx="zoom">4</div>${H('Site <em>no ar.</em>', .05, 150)}
        <div style="margin-top:50px;background:#fff;color:var(--plum);border-radius:26px;padding:34px 36px;font:700 50px 'DM Sans';min-height:124px" data-at=".5" data-fx="up"><span data-at=".8" data-fx="none" data-type data-d=".9">seunegocio.com.br</span></div>
        <div class="stamp" data-at="1.8" data-fx="pop" style="display:flex;align-items:center;gap:18px">${CHECK} Publicado!</div>`],
      [3.5, 'light', `${H('E ainda <em>vem junto:</em>', .05, 130)}
        <div class="feats" style="margin-top:44px">${['Funciona em qualquer tela', '12 meses de hospedagem*', 'Contato direto no WhatsApp', 'Painel para editar: adicional'].map((t, i) => `<div class="feat" style="font-size:46px" data-at="${.5 + i * .25}" data-fx="right">${CHECK}<span>${t}</span></div>`).join('')}</div>
        ${VFINE('*Dentro dos limites da proposta.')}`],
      [2, 'vivid center', `<div class="m" style="font-size:64px;margin-bottom:40px" data-at="0" data-fx="down">Com a Vorkeza você tem:</div>
        ${['Sites', 'Cardápios digitais', 'Painéis de gestão'].map((t, i) => `<div class="m" style="font-size:112px;margin-top:22px" data-at="${.15 + i * .25}" data-fx="zoom" data-d=".45">${t}</div>`).join('')}`],
      CTA('Seu site começa com uma conversa.', 'Preço fechado, sem enrolação.'),
    ]
  },
  3: {
    file: 'video-3-cardapio-e-painel', scenes: [
      [2.5, '', `${H('Ainda anota pedido <em>no papel?</em>', .1, 148)}`],
      [3, 'vivid', `${H('O cliente <em>escolhe.</em>', .05, 120)}<div style="margin-top:44px;align-self:center" data-at=".2" data-fx="up" data-float="8">
        <div style="zoom:1;" >${phone(menuScreen({ at: .35, listAttr: 'data-at="0" data-fx="none" data-to="y:-180" data-to-at="1.1" data-to-d="1.5"' }), 1.1)}</div></div>`],
      [3.5, 'light', `${H('Toca e <em>adiciona.</em>', .05, 120)}<div style="margin-top:44px;align-self:center;position:relative" data-at=".2" data-fx="up">
        ${phone(menuScreen({ cart: 1.75 }), 1.1)}
        <div class="tap" style="right:60px;top:318px" data-at=".95" data-fx="ripple" data-d=".55"></div>
        <div class="tap" style="right:60px;top:416px" data-at="1.55" data-fx="ripple" data-d=".55"></div></div>`],
      [3.5, '', `${H('Chega pronto <em>no WhatsApp.</em>', .05, 112)}<div style="margin-top:44px;align-self:center" data-at=".2" data-fx="up" data-float="8">${phone(whatsScreen({ at: .75 }), 1.1)}</div>`],
      [3, 'vivid center', `<div class="m" style="font-size:60px" data-at="0" data-fx="down">Quanto você paga por pedido?</div><div class="m" style="font-size:380px;line-height:1.05;letter-spacing:-.06em" data-at=".35" data-fx="zoom" data-beat>R$ 0</div>${H('de comissão.', .85, 130)}`],
      [2.5, 'light center', `${H('Quer controlar <em>tudo?</em>', .05, 150)}`],
      [4, '', `${TAG('Painel Completo')}${H('Abre e fecha <em>o caixa.</em>', .05, 112)}<div style="margin-top:38px;align-self:center" data-at=".2" data-fx="up">${phone(caixaScreen({ at: .55 }), 1.05)}</div>`],
      [3, 'light', `${H('E muito <em>mais:</em>', .05, 138)}<div class="feats" style="margin-top:46px">${['Loja aberta ou fechada', 'Pedidos em um só lugar', 'Despesas do negócio', 'Equipe e histórico'].map((t, i) => `<div class="feat" style="font-size:48px" data-at="${.45 + i * .22}" data-fx="right">${CHECK}<span>${t}</span></div>`).join('')}</div>`],
      [1.5, 'vivid center', `${H('Quero o meu!', .02, 170)}`],
      CTA('Seu cardápio. <em>Suas vendas.</em>', 'Cardápio a partir de R$ 1.490. Valor confirmado na proposta.'),
    ]
  },
};
