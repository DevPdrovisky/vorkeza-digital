# Produto — gerador de sites de estoque

Cada revenda é uma pasta em `clientes/` com dois arquivos. O gerador transforma isso num site pronto em `saida/<slug>/`.

```
clientes/<slug>/
  loja.json      nome, cidade, WhatsApp, cores, modo (demo | previa | oficial)
  estoque.json   lista de veículos
  fotos/         fotos locais (clientes oficiais)
```

## Comandos

```bash
node gerar.mjs novo nome-da-revenda     # cria a pasta para preencher
node gerar.mjs nome-da-revenda          # gera o site em saida/
node gerar.mjs todos                    # gera todos
```

O gerador recusa dados quebrados (preço inválido, foto faltando, WhatsApp no formato errado).

## Modos

| modo | Onde vai ao ar | Faixa no topo | Google |
|---|---|---|---|
| `demo` | `vitrinemotor.pages.dev/demo/` | "Revenda fictícia" | não indexa |
| `previa` | `vitrinemotor.pages.dev/previa/<slug>/` | "Prévia feita pela Vitrine Motor" | não indexa |
| `oficial` | projeto Cloudflare próprio da revenda, com domínio dela | nenhuma | indexa se `"indexar": true` |

## Montar uma prévia (o jeito rápido)

Peça para o Claude: **"monta a prévia da [revenda] com o estoque deste link: [link]"**. Ele cria a pasta, preenche o estoque com os carros públicos, gera e confere. As fotos de prévia ficam como link (`"url"`) para as fotos que a própria loja já publicou; nada é baixado.

Manualmente: `node gerar.mjs novo slug`, preencha os dois JSON, use `{ "url": "https://..." }` nas fotos e rode `node ../ferramentas/montar.mjs`.

## Campos do veículo

`id`, `marca`, `modelo`, `versao`, `anoFab`, `anoMod`, `km`, `preco`, `precoAntigo` (mostra "Baixou o preço"), `categoria` (Hatch, Sedã, SUV, Picape, Moto...), `cambio`, `combustivel`, `cor`, `portas`, `finalPlaca`, `selos` (ex.: "Único dono"), `destaque`, `status` (`disponivel`, `reservado`, `vendido`), `entrada` (AAAA-MM-DD; até 7 dias mostra "Novo no estoque"), `opcionais`, `descricao`, `fotos`.

## Atualizar o estoque de um cliente

1. Fotos novas em `clientes/<slug>/fotos/` (o gerador converte para WebP e reduz o tamanho).
2. Adicione o carro no `estoque.json` com `"fotos": [{ "arquivo": "onix-1.jpg" }, ...]`.
3. Vendeu: mude `"status": "vendido"` (fica no site com a tarja por alguns dias, gera arte "Vendido") e depois apague.
4. Rode `node gerar.mjs <slug>` e publique.

Ou peça ao Claude: "na revenda X, entrou um Onix 2020 por 62.900 com estas fotos; vendeu o Kwid".

## Publicar o site oficial de um cliente

Cada cliente oficial tem um projeto Cloudflare Pages próprio (grátis, na sua conta):

```powershell
.\ferramentas\publicar-cliente.ps1 nome-da-revenda
```

Na primeira vez o Wrangler cria o projeto `vm-nome-da-revenda`. Depois, adicione o domínio do cliente em Cloudflare → Workers & Pages → projeto → Custom domains.

## Arquivos do modelo

`modelo/estilo.css` (visual), `modelo/vitrine.js` (filtros, galeria, formulários), `modelo/artes.js` (gerador de artes), `modelo/fontes/` (Manrope e DM Sans, licença OFL). Melhorou o modelo, rode `todos` e todos os sites ganham a melhoria.
