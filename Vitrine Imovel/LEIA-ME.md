# VITRINE IMÓVEL — comece aqui

**Vitrine Imóvel — uma empresa Vorkeza.**

Site de imóveis para corretores autônomos e imobiliárias pequenas. Cada imóvel tem um link próprio, com foto e preço que aparecem no WhatsApp, e um botão "Tenho interesse" com a mensagem pronta. Também gera artes de status, inclusive VENDIDO e ALUGADO.

A fórmula é a mesma da Vitrine Motor:
1. Montamos uma **prévia grátis** com os imóveis que o corretor já anuncia em público.
2. Mostramos a prévia pelo WhatsApp.
3. Quem gostar paga a implantação e a mensalidade.

Montado em 10/11/2026. **Nada foi publicado nem enviado ainda.**

## O que tem em cada pasta

| Pasta | O que é |
|---|---|
| `1-Plano/PLANO.md` | A ideia, os preços, a conta e os riscos |
| `2-Site/` | Site de vendas da Vitrine Imóvel. Vai para a URL definida em `../grupo/grupo.json`, hoje `vitrineimovel.pages.dev` |
| `3-Produto/` | O gerador de sites de imóveis e a imobiliária de exemplo, "Lar Modelo Imóveis" (fictícia) |
| `5-Vendas/` | Scripts de WhatsApp, proposta e contrato modelo |
| `ferramentas/` | Montar, publicar e gerar as imagens do site de vendas |
| `publicar/` | O que vai ao ar. É gerado automaticamente; não edite à mão |

## Ver no computador

```powershell
node ferramentas/montar.mjs
npx --yes http-server@14.1.1 publicar -p 8200 -c-1
```

Depois abra estes endereços:
- http://localhost:8200 — site de vendas
- http://localhost:8200/demo/ — imobiliária de exemplo
- http://localhost:8200/demo/artes/ — gerador de artes

## Checklist do lançamento (o que você faz)

1. [ ] Ler o plano e aprovar os preços.
2. [ ] Decidir se usa o mesmo WhatsApp Business da Vitrine Motor. Recomendo que sim: no começo, um número só, com etiquetas por marca.
3. [ ] Instagram `@vitrineimovel`, ou outro nome. Me passe o @.
4. [ ] Me dar o **"pode publicar"**. Eu rodo `ferramentas/publicar.ps1` e o site vai ao ar no projeto Cloudflare `vitrineimovel`.
5. [ ] Escolher 10 corretores ou imobiliárias da região com anúncios públicos e me pedir as prévias.
6. [ ] Mandar as primeiras mensagens pelo seu celular, até 15 por dia. Os textos estão em `5-Vendas/SCRIPTS-WHATSAPP.md`.

## Como pedir as coisas ao Claude

- "Monta a prévia do corretor X com estes anúncios: [link]"
- "Na imobiliária Y, o apartamento 203 foi alugado; entrou uma casa no Centro por 450 mil com estas fotos."
- "Publica a Vitrine Imóvel."
