# AVALIA AÍ — comece aqui

**Boca a Boca — uma empresa Vorkeza.** Nome trocado em 10/11/2026: era "Avalia Aí".

Plaquinha de balcão e adesivo com QR, na cor da loja. O QR abre a página da loja, que tem um botão grande para o cliente avaliar o negócio no Google. Todo mês, a loja recebe um relatório simples.

A fórmula do grupo:
1. A **prévia grátis** aqui é **a arte da plaquinha** com o nome e a cor da loja.
2. Mandamos a arte pelo WhatsApp.
3. Quem gostar paga a implantação e a mensalidade.

Montado em 10/11/2026. **Nada foi publicado nem enviado ainda.**

> **Regra que não muda: sem filtro de avaliação.** Todo cliente vê o botão de avaliação pública, em primeiro lugar. A mensagem privada no WhatsApp é um extra e **nunca** substitui nem esconde a avaliação. Não pergunte "gostou?" antes de mostrar o botão, e não ofereça brinde em troca de avaliação. As duas coisas são proibidas pelas regras da plataforma e podem derrubar o perfil do cliente.

## O que tem em cada pasta

| Pasta | O que é |
|---|---|
| `1-Plano/PLANO.md` | A ideia, os preços, a conta e os riscos |
| `2-Site/` | Site de vendas. Vai para a URL de `../grupo/grupo.json`, hoje `bocaaboca.pages.dev` |
| `3-Produto/gerar.mjs` | Gera a página da loja, as plaquinhas e o relatório |
| `3-Produto/clientes/padaria-modelo/` | Loja de exemplo (fictícia) |
| `5-Vendas/` | Scripts de WhatsApp, proposta e contrato modelo |
| `ferramentas/` | `placas.cjs` (gera PNG e PDF), montar, publicar e as imagens do site de vendas |
| `publicar/` | O que vai ao ar. É gerado automaticamente; não edite à mão |

## Ver no computador

```powershell
node ferramentas/montar.mjs
npx --yes http-server@14.1.1 publicar -p 8400 -c-1
```

Depois abra estes endereços:
- http://localhost:8400 — site de vendas
- http://localhost:8400/demo/ — página da loja de exemplo
- http://localhost:8400/demo/placa/ — plaquinhas (os arquivos PNG e PDF ficam nesta pasta)
- http://localhost:8400/demo/relatorio/ — relatório de exemplo

## Nova loja, passo a passo

1. `node 3-Produto/gerar.mjs novo <nome-da-loja>` e preencha `loja.json`: nome, cidade, cor (#RRGGBB) e o WhatsApp para mensagens privadas, se a loja quiser.
2. **Prévia** (`"modo": "previa"`, que é o padrão): rode `node 3-Produto/gerar.mjs <nome-da-loja>` e `node ferramentas/placas.cjs <nome-da-loja>`. Mande o `placa.png` que fica em `3-Produto/saida/<nome-da-loja>/placa/`.
3. **Fechou:** preencha o `placeId` da loja. O dono acha no painel do perfil, ou use o "Place ID Finder" da documentação do Google Maps. Troque o modo para `"cliente"` e gere de novo. Sem `placeId`, o gerador não deixa passar.
4. Me peça para publicar. A página fica em `bocaaboca.pages.dev/l/<nome-da-loja>/`. **Depois de imprimir, esse endereço não pode mudar.**
5. Teste o QR impresso com 2 celulares antes de entregar.
6. Todo mês, preencha `relatorio.json` com estes números e gere o relatório:
   - **Acessos:** vêm do Cloudflare Web Analytics.
   - **Avaliações e nota:** vêm do perfil público.
   - **Mensagens privadas:** conte as que chegaram no WhatsApp.

   Mande o print ou o PDF ao cliente. O relatório **não** vai ao ar.

## Checklist do lançamento (o que você faz)

1. [ ] Aprovar os preços.
2. [ ] Criar o Instagram da marca e me passar o @.
3. [ ] Me dar o **"pode publicar"**. Eu rodo `ferramentas/publicar.ps1` (projeto Cloudflare `bocaaboca`).
4. [ ] Ativar o Web Analytics do projeto no painel da Cloudflare, para contar os acessos.
5. [ ] Ver o preço de impressão em uma gráfica rápida da cidade (PS 2 mm ou acrílico; adesivo em vinil).
6. [ ] Oferecer primeiro aos clientes das outras marcas (complemento de R$ 29).
