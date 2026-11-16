# Vitrine Imóvel — plano

**Vitrine Imóvel — uma empresa Vorkeza.**

## A ideia em uma frase

Site de imóveis para corretor autônomo e imobiliária pequena. Cada imóvel tem um link que mostra foto e preço no WhatsApp, um botão "Tenho interesse" com mensagem pronta e artes de status (inclusive VENDIDO e ALUGADO). Vendemos mostrando **uma prévia pronta com os imóveis reais do corretor**.

## Por que esse nicho

- **O corretor vive no WhatsApp.** Passa o dia mandando foto solta e repetindo a ficha de cada imóvel.
- **Os imóveis são públicos.** Portais, Instagram e sites antigos mostram foto, preço e bairro. Dá para montar a prévia sem pedir nada.
- **O gerador já existe.** É o mesmo motor da Vitrine Motor, adaptado para imóveis: finalidade (venda ou aluguel), tipo, bairro, quartos, suítes, vagas, área, condomínio e IPTU.
- **Ticket por negócio é alto.** Uma comissão paga anos de site.

## Oferta

| Plano | Implantação | Mensal | Para quem |
|---|---|---|---|
| Corretor | R$ 497 | R$ 99 | Autônomo, até 30 imóveis |
| **Imobiliária** | R$ 997 (2x) | R$ 149 | Até 120 imóveis e 5 corretores |
| Fundador (5 primeiros) | metade: R$ 247 / R$ 497 | 1º mês grátis | Em troca de depoimento |

Sem fidelidade. Aviso de 30 dias para cancelar. Domínio no nome do cliente.

## Regra de ouro: nada inventado

Na prévia usamos **só o que está no anúncio público**. O que não estiver lá fica `null` no `imoveis.json` e aparece no site como **"A confirmar"**: metragem, condomínio, IPTU, vagas e suítes. O endereço exato nunca aparece, só bairro e cidade.

## A conta (cenário base, 10 meses)

Premissas: as 5 primeiras vendas são de fundadores. Depois, de cada 10 clientes, 6 são Corretor e 4 Imobiliária. Uma venda nova por semana.

| Mês | Ativos | Mensalidade recorrente | Acumulado aprox. |
|---|---|---|---|
| 3 | 12 | R$ 1.400 | R$ 9.000 |
| 6 | 25 | R$ 3.000 | R$ 25.000 |
| 10 | 42 | R$ 5.100 | R$ 52.000 |

Isso é meta com conta feita, não garantia. Recalcule depois das primeiras 40 abordagens.

## Riscos

| Risco | O que fazer |
|---|---|
| Dado errado de imóvel | Só usar o anúncio público e marcar "A confirmar" no resto |
| Proprietário não quer o imóvel exposto | O corretor decide o que publica; tiramos do ar em até 1 dia útil |
| CRECI | Mostrar o CRECI do corretor ou da imobiliária no rodapé do site oficial (campo `creci`) |
| Concorrência de portais e sistemas grandes | Nosso lado: preço, prévia grátis, serviço feito por nós, artes prontas |
| Marca "Vitrine Imóvel" | Fazer a busca no INPI antes de registrar. "Vitrine" é termo comum no setor, o que reduz a exclusividade |
