# PERFIL NO GOOGLE — comece aqui

**Bem no Mapa — uma empresa Vorkeza.**

Cuidamos do perfil de empresa no Google (o que aparece no mapa e na busca) de comércios e serviços locais: fotos, horário, descrição, produtos, respostas às avaliações e postagens.

A fórmula do grupo:
1. A **prévia grátis** aqui é um **raio-x**: uma página que mostra como o perfil do negócio está hoje e compara com 3 concorrentes da cidade, só com dados públicos.
2. Mandamos o link do raio-x pelo WhatsApp.
3. Quem quiser paga a implantação e a mensalidade.

Montado em 10/11/2026. **Nada foi publicado nem enviado ainda.**

> Nome trocado em 10/11/2026: era "Perfil no Google". A seção "Nome" em `1-Plano/PLANO.md` explica o motivo.

## O que tem em cada pasta

| Pasta | O que é |
|---|---|
| `1-Plano/PLANO.md` | A ideia, os preços, a conta, os riscos e o motivo do nome |
| `2-Site/` | Site de vendas. Vai para a URL de `../grupo/grupo.json`, hoje `bemnomapa.pages.dev` |
| `3-Produto/` | O gerador do raio-x (`gerar-raio-x.mjs`) e o exemplo "Doceria Modelo" (fictício) |
| `5-Vendas/` | Scripts de WhatsApp, proposta e contrato modelo |
| `ferramentas/` | Montar, publicar e gerar as imagens do site de vendas |
| `publicar/` | O que vai ao ar. É gerado automaticamente; não edite à mão |

## Ver no computador

```powershell
node ferramentas/montar.mjs
npx --yes http-server@14.1.1 publicar -p 8300 -c-1
```

Depois abra estes endereços:
- http://localhost:8300 — site de vendas
- http://localhost:8300/demo/ — raio-x de exemplo

## Como fazer um raio-x de um negócio real

1. Copie `3-Produto/clientes/doceria-modelo/` para `3-Produto/clientes/<nome-do-negocio>/`, ou rode `node 3-Produto/gerar-raio-x.mjs novo <nome-do-negocio>`.
2. Abra o perfil público do negócio no mapa e preencha `raio-x.json` com o que **estiver lá**: nota, número de avaliações, quantas têm resposta, fotos, horário etc. Faça o mesmo para 3 concorrentes do mesmo ramo e cidade.
3. O que você não conseguir ver, deixe `null`: aparece "A confirmar" e não entra na nota. **Nunca chute.**
4. Troque `"modo"` para `"previa"` e rode `node ferramentas/montar.mjs`. O raio-x fica em `/previa/<nome-do-negocio>/`.

## Checklist do lançamento (o que você faz)

1. [ ] Ler o plano e aprovar os preços.
2. [ ] Fazer a busca no INPI de "Bem no Mapa" (classe 35).
3. [ ] Registrar o domínio bemnomapa.com.br se estiver livre (pode ser depois da primeira venda).
4. [ ] Criar o Instagram da marca e me passar o @.
5. [ ] Me dar o **"pode publicar"**. Eu rodo `ferramentas/publicar.ps1` e o site vai ao ar no projeto Cloudflare `bemnomapa`.
6. [ ] Escolher 10 negócios da cidade com perfil fraco e me pedir os raio-x.
7. [ ] Mandar as primeiras mensagens pelo seu celular. Os textos estão em `5-Vendas/SCRIPTS-WHATSAPP.md`.

## Como pedir as coisas ao Claude

- "Faz o raio-x da Padaria X de Artur Nogueira. Concorrentes: Y, Z e W."
- "Publica a Bem no Mapa."
