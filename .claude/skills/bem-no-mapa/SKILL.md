---
name: bem-no-mapa
description: Bem no Mapa — raio-x grátis do perfil de um negócio no mapa (comparando com concorrentes), cliente novo de cuidado do perfil, publicar raio-x ou o site bemnomapa.pages.dev. Use quando o pedido falar em raio-x, perfil no mapa, perfil da empresa, avaliações respondidas ou Bem no Mapa.
---

# Bem no Mapa — cuidado do perfil da empresa no mapa

Tudo fica em `Bem no Mapa/`. Detalhes em `Bem no Mapa/LEIA-ME.md`.

## Pedidos e o que fazer

**"Faz o raio-x da Padaria X de (cidade). Concorrentes: Y, Z e W."**
1. `node "Bem no Mapa/3-Produto/gerar-raio-x.mjs" novo <slug>`.
2. Preencher `3-Produto/clientes/<slug>/raio-x.json` **só com o que está público no perfil**: nota, nº de avaliações, quantas respondidas, fotos, horário, descrição, postagens. Igual para os 3 concorrentes do mesmo ramo e cidade.
3. Se não conseguir ver um dado (ou o usuário não passou), deixe `null` → "A confirmar", e ele não entra na nota. **Nunca chute.** Se não houver como abrir o perfil, peça os números ao usuário.
4. `"modo": "previa"`, `node "Bem no Mapa/ferramentas/montar.mjs"`, conferir em http://localhost:8300/previa/<slug>/, mandar print.
5. Publicar só com OK: `.\ferramentas\publicar.ps1` (fica em `bemnomapa.pages.dev/previa/<slug>/`).

**"Fechou com X"** → o serviço é feito no perfil do cliente, com acesso que **o próprio dono** dá ao usuário. Preparar: textos de descrição, respostas às avaliações (educadas, sem prometer brinde), calendário de postagens. Quem posta e responde é o usuário, no perfil.

**"Muda o site da Bem no Mapa"** → `Bem no Mapa/2-Site/` (o CSS base é `grupo/site-marca.css`, compartilhado com o Boca a Boca: mudança ali afeta os dois). Publicar: `.\ferramentas\publicar.ps1`.

## Não fazer
- Usar logo, cores ou visual do Google, ou dizer que somos do Google.
- Escrever avaliação falsa ou oferecer vantagem por avaliação.
- Mexer em outra marca, mandar mensagem pelo usuário ou publicar sem OK.
