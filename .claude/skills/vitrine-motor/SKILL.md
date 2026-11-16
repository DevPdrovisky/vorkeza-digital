---
name: vitrine-motor
description: Vitrine Motor — prévia ou site oficial de estoque para revenda de carros/motos, atualizar estoque (entrou carro, vendeu carro), artes de status, publicar site de revenda ou o site vitrinemotor.pages.dev. Use quando o pedido falar em revenda, carro, moto, estoque, Napista ou Vitrine Motor.
---

# Vitrine Motor — sites de estoque para revendas

Tudo fica em `Vitrine Motor/`. Leia `Vitrine Motor/3-Produto/LEIA-ME.md` se precisar de detalhe dos campos.

## Pedidos e o que fazer

**"Monta a prévia da revenda X (com este link / estes carros)"**
1. `cd "Vitrine Motor/3-Produto"` e `node gerar.mjs novo <slug>`.
2. Preencha `clientes/<slug>/loja.json` (nome, cidade, WhatsApp 55+DDD+número, cor, `"modo": "previa"`) e `estoque.json` só com carros públicos da loja. Link do Napista: `node ../ferramentas/importar-napista.mjs <url> <slug> [whatsapp] [#cor]` (já cria a pasta e o estoque). Fotos de prévia ficam como `{ "url": "..." }` (não baixar).
3. O que o anúncio não informa fica `null` ("A confirmar"). **Nunca chute** km, preço, ano ou opcionais.
4. `node ../ferramentas/montar.mjs`, conferir em http://localhost:8100/previa/<slug>/ (desktop e celular), mandar print.
5. Publicar só com OK: `.\ferramentas\publicar.ps1` (vai em `vitrinemotor.pages.dev/previa/<slug>/`).

**"Fechou com a revenda X"** → `"modo": "oficial"`, fotos locais em `clientes/<slug>/fotos/`, gerar e, com OK, `.\ferramentas\publicar-cliente.ps1 <slug>` (projeto `vm-<slug>`). Domínio do cliente: o usuário aponta em Custom domains.

**"Na revenda X entrou um Onix 2020 por 62.900 / vendeu o Kwid"** → só `estoque.json` daquela revenda: novo carro com `entrada` de hoje; vendido = `"status": "vendido"`. Rodar `node gerar.mjs <slug>`, conferir, publicar com OK.

**"Muda o site da Vitrine Motor"** → `Vitrine Motor/2-Site/` (nunca edite `publicar/`, ele é gerado). Publicar: `.\ferramentas\publicar.ps1`.

**Melhoria no modelo de todas as revendas** → `3-Produto/modelo/` e depois `node gerar.mjs todos`. Avise que todas as revendas mudam.

## Não fazer
- Mexer em outra revenda ou em outra marca do grupo.
- Mandar mensagem para revenda (os textos estão em `5-Vendas/SCRIPTS-WHATSAPP.md`; quem envia é o usuário).
- Publicar sem "pode publicar".
