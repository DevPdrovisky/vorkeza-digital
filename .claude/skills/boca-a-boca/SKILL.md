---
name: boca-a-boca
description: Boca a Boca — arte da plaquinha com QR de avaliação para uma loja, página da loja, relatório do mês, arte nova, publicar loja ou o site bocaaboca.pages.dev. Use quando o pedido falar em plaquinha, QR, adesivo, avaliação, relatório do mês ou Boca a Boca.
---

# Boca a Boca — plaquinha com QR para avaliação

Tudo fica em `Boca a Boca/`. Detalhes em `Boca a Boca/LEIA-ME.md`.

> **Regra que nunca muda:** todo cliente vê o botão de avaliação pública primeiro. Sem filtro ("gostou?" antes), sem brinde em troca de estrela. A mensagem privada é só um extra, embaixo.

## Pedidos e o que fazer

**"Faz a plaquinha da loja X (cidade, cor)"** — é a prévia grátis
1. `node "Boca a Boca/3-Produto/gerar.mjs" novo <slug>` e preencher `loja.json`: nome, cidade, cor (#RRGGBB), WhatsApp para mensagem privada (se a loja quiser; senão `null`). `"modo": "previa"`.
2. `node "Boca a Boca/3-Produto/gerar.mjs" <slug>` e `node "Boca a Boca/ferramentas/placas.cjs" <slug>`.
3. Conferir e mandar ao usuário `3-Produto/saida/<slug>/placa/placa.png` e `adesivo.png` (SendUserFile).

**"Fechou com a loja X"**
1. Precisa do `placeId` do perfil da loja ou do `linkAvaliacao` (link "pedir avaliações" que o dono copia do perfil). Sem um dos dois o gerador recusa: **peça ao usuário, não invente**.
2. `"modo": "cliente"`, gerar de novo (página + placas em PDF e PNG).
3. Com OK, `.\ferramentas\publicar.ps1`. A página fica em `bocaaboca.pages.dev/l/<slug>/`. **Depois de impresso, esse endereço e o slug nunca mudam.**
4. Lembrar o usuário: testar o QR impresso em 2 celulares.

**"Relatório do mês da loja X: acessos A, avaliações B, nota C, mensagens D"**
- Preencher `3-Produto/clientes/<slug>/relatorio.json` só com os números que o usuário passou (o que faltar fica `null`), gerar e mandar o print/PDF ao usuário. O relatório **não** vai ao ar.

**"Arte nova da loja X"** → mudar `loja.json` (cor, nome, frase), gerar as placas e mandar. O endereço da página continua o mesmo.

**"Muda o site do Boca a Boca"** → `Boca a Boca/2-Site/` (CSS base `grupo/site-marca.css` também é da Bem no Mapa). Publicar: `.\ferramentas\publicar.ps1`.

## Não fazer
- Logo, cores ou visual do Google.
- Mudar o slug de loja que já imprimiu, ou o nome do projeto `bocaaboca`.
- Mexer em outra marca, mandar mensagem pelo usuário ou publicar sem OK.
