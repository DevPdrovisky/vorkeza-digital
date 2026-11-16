---
name: vitrine-imovel
description: Vitrine Imóvel — prévia ou site oficial para corretor ou imobiliária, atualizar imóveis (entrou, vendeu, alugou), artes VENDIDO/ALUGADO, publicar site de corretor ou o site vitrineimovel.pages.dev. Use quando o pedido falar em corretor, imobiliária, imóvel, casa, apartamento, aluguel ou Vitrine Imóvel.
---

# Vitrine Imóvel — sites para corretores e imobiliárias

Tudo fica em `Vitrine Imovel/`. Campos e regras em `Vitrine Imovel/3-Produto/LEIA-ME.md`.

## Pedidos e o que fazer

**"Monta a prévia do corretor X com estes anúncios"**
1. `cd "Vitrine Imovel/3-Produto"` e `node gerar.mjs novo <slug>`.
2. `loja.json`: nome, cidade, WhatsApp (55+DDD+número), **CRECI** (se não tiver, `null`), cor, `"modo": "previa"`.
3. `imoveis.json` só com imóveis que o corretor anuncia em público. `finalidade` venda/aluguel, `tipo` Casa/Apartamento/Terreno/Comercial. Fotos de prévia como `{ "url": "..." }`.
4. O que o anúncio não diz (condomínio, IPTU, área, vagas) fica `null` → "A confirmar". **Nunca chute.**
5. `node ../ferramentas/montar.mjs`, conferir em http://localhost:8200/previa/<slug>/, mandar print.
6. Publicar só com OK: `.\ferramentas\publicar.ps1`.

**"Fechou com o corretor X"** → `"modo": "oficial"`, fotos locais em `clientes/<slug>/fotos/`, e com OK `.\ferramentas\publicar-cliente.ps1 <slug>` (projeto `vi-<slug>`).

**"O apto 203 foi alugado / entrou uma casa no Centro por 450 mil"** → só o `imoveis.json` daquele cliente (`status` vendido/alugado; novo imóvel com `entrada` de hoje). Gerar, conferir, publicar com OK.

**"Muda o site da Vitrine Imóvel"** → `Vitrine Imovel/2-Site/` (nunca edite `publicar/`). Publicar: `.\ferramentas\publicar.ps1`.

## Não fazer
- Marcar "alugado" em imóvel de venda (o gerador recusa).
- Mexer em outro cliente ou outra marca.
- Mandar mensagem pelo usuário ou publicar sem OK.
