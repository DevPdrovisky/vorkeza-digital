# Produto — gerador de sites de imóveis

Cada cliente (corretor ou imobiliária) é uma pasta em `clientes/` com dois arquivos e, se tiver, as fotos. O gerador transforma isso num site pronto em `saida/<slug>/`.

```
clientes/<slug>/
  loja.json      nome, cidade, WhatsApp, CRECI, cores, modo (demo | previa | oficial)
  imoveis.json   lista de imóveis
  fotos/         fotos locais (clientes oficiais)
```

## Comandos

```bash
node gerar.mjs novo nome-do-corretor
node gerar.mjs nome-do-corretor
node gerar.mjs todos
```

O gerador recusa dados quebrados: finalidade ou tipo inválidos, preço inválido, foto faltando ou "alugado" num imóvel à venda.

## Campos do imóvel

- `id`
- `finalidade`: `venda` ou `aluguel`
- `tipo`: `Casa`, `Apartamento`, `Terreno` ou `Comercial`
- `titulo`
- `bairro`, `cidade`, `uf`
- `quartos`, `suites`, `vagas`
- `area` em m²; num terreno, é a área do terreno
- `areaTerreno`
- `condominio`, por mês
- `iptu`: por ano na venda, por mês no aluguel
- `preco`: o total na venda, o valor por mês no aluguel
- `precoAntigo`: faz aparecer "Baixou o preço"
- `destaque`
- `status`: `disponivel`, `reservado`, `vendido` ou `alugado`
- `entrada`: até 7 dias depois dela, o imóvel aparece como "Novidade"
- `caracteristicas`, `descricao`, `fotos`

**O que o anúncio não informa fica `null`** e aparece como "A confirmar". Nunca preencha com chute.

## Filtros do site

Os visitantes podem filtrar por:
- comprar ou alugar
- tipo, cidade (quando há mais de uma) e bairro
- preço até
- quartos, suítes e vagas (mínimo)
- área mínima
- condomínio até e IPTU até
- ordenação

Os filtros ficam no endereço da página, então dá para mandar o link "casas para alugar no Centro" pelo WhatsApp.

## Artes

Ficam em `<site>/artes/`:
- story/status (1080x1920)
- feed (1080x1350)
- "VENDIDO" ou "ALUGADO", conforme a finalidade

## Publicar o site oficial de um cliente

Mude `"modo": "oficial"` no `loja.json` e rode `..\ferramentas\publicar-cliente.ps1 <slug>`. O site vai para o projeto Cloudflare `vi-<slug>`. No rodapé de todo site gerado aparece: "Site feito pela Vitrine Imóvel — uma empresa Vorkeza".
