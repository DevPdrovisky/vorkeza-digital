# Grupo Vorkeza — como trabalhar aqui

Responda sempre em português do Brasil, com palavras simples.

## Qual área o pedido é (use o comando da área)

| Se o pedido fala em… | Área | Comando | Pasta |
|---|---|---|---|
| site express, site profissional, cardápio, delivery, delivery pro, site para cliente, site da Vorkeza | Vorkeza Digital | `/vorkeza` | raiz + `clientes-vorkeza/` |
| revenda, carro, moto, estoque, Napista | Vitrine Motor | `/vitrine-motor` | `Vitrine Motor/` |
| corretor, imobiliária, imóvel, aluguel | Vitrine Imóvel | `/vitrine-imovel` | `Vitrine Imovel/` |
| raio-x, perfil no mapa, responder avaliações | Bem no Mapa | `/bem-no-mapa` | `Bem no Mapa/` |
| plaquinha, QR, adesivo, relatório do mês da loja | Boca a Boca | `/boca-a-boca` | `Boca a Boca/` |

Se não der para saber a área, pergunte numa linha antes de mexer.

## Para não bagunçar
- **Mexa só na pasta da área e do cliente do pedido.** Nada de "aproveitar" para mudar outra marca.
- `grupo/` é compartilhado por todos: `grupo.json` (nomes, cores e URLs das marcas), `grupo.js/css`, `movimento.js/css`, `site-marca.css/js`. Mudou algo ali → avise que afeta todas as marcas e, se publicar, publique todas (cada site leva uma cópia).
- Pastas `publicar/` e `publicar-netlify/` são geradas: nunca edite à mão.
- Antes de reescrever um arquivo grande do site, guarde uma cópia em `backup-azul/`.
- Ao mudar preço, mude em todos os lugares onde ele aparece (cards, `app.js`, perguntas frequentes, proposta em `5-Vendas/`).

## Regras do grupo
- **Nunca invente dado** de cliente (preço, telefone, nota, avaliações, km, depoimento). O que faltar fica `null` e aparece "A confirmar".
- Exemplos e demos usam só dados fictícios, com aviso de que são fictícios.
- **Sem azul** no visual (a menos que seja a cor da marca do cliente).
- **Nada de logo, cores ou visual do Google**; não dizer que somos do Google.
- Boca a Boca: **sem filtro de avaliação**, nunca.
- **Publicar só com "pode publicar"** do usuário, a cada vez. Depois de publicar, conferir o endereço no ar.
- **Nunca mandar WhatsApp, e-mail ou mensagem** pelo usuário: preparar o texto e ele envia.
- Login, pagamento, criação de conta, compra de domínio e exclusões: quem faz é o usuário.
- Nunca repetir o token da Cloudflare.

## Pagamento e prazos (padrão do grupo)
50% para começar e 50% na entrega; Pix, cartão de débito ou crédito. Prévia grátis antes de pagar em todas as marcas.

## Conferir
Prints com `node pack-instagram-src/conferir-site.js <url> <largura> <altura> <prefixo> "<seletor>@<offset>"` (1440×900 e 375×812). Portas locais em `.claude/launch.json`: 8000 Vorkeza, 8100 VM, 8200 VI, 8300 Bem no Mapa, 8400 Boca a Boca, 8500 cliente Vorkeza.
