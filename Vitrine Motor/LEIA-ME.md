# VITRINE MOTOR — comece aqui

Site de estoque para revendas de carros e motos, vendido com prévia grátis feita com os carros reais da loja.
Montado em 10/11/2026. **Nada foi publicado nem enviado ainda**: tudo espera o seu "vamos".

## O que tem em cada pasta

| Pasta | O que é |
|---|---|
| `1-Plano/PLANO.md` | A ideia, os preços, a conta até R$ 100 mil, metas e riscos |
| `2-Site/` | Site de vendas da Vitrine Motor (vai para `vitrinemotor.pages.dev`) |
| `3-Produto/` | O gerador de sites das revendas + a revenda de exemplo + a prévia da Br Kar |
| `4-Marketing/` | 6 posts, 3 stories, foto de perfil, legendas, roteiros de Reels e calendário de 30 dias |
| `5-Vendas/` | 28 revendas da região (`prospects.csv`), scripts de WhatsApp, proposta, contrato, rotina |
| `ferramentas/` | Montar, publicar, importar prévia do Napista, gerar artes de marketing |
| `publicar/` | O que vai ao ar (gerado automaticamente; não edite à mão) |

## Ver no computador

```powershell
node ferramentas/montar.mjs
npx --yes http-server@14.1.1 publicar -p 8100 -c-1
```
Abra http://localhost:8100 (site), /demo/ (revenda de exemplo), /demo/artes/ (gerador de artes), /previa/br-kar-multimarcas/ (prévia real).

## Checklist do lançamento (o que você faz)

1. [ ] **Ler o plano** e aprovar os preços (ou me pedir para mudar).
2. [ ] **WhatsApp Business** no seu número (mantém as conversas). Perfil: "Pedro | Vitrine Motor".
3. [ ] **Instagram** `@vitrinemotor` (ou alternativa da lista em `4-Marketing/`). Me passe o @ para eu colocar no site.
4. [ ] **Me dar o "pode publicar"**: eu rodo `ferramentas/publicar.ps1` e o site + demo vão ao ar em `vitrinemotor.pages.dev`.
5. [ ] Postar os 6 posts e o story 2 (ordem e legendas em `4-Marketing/LEGENDAS-E-CALENDARIO.md`).
6. [ ] Abrir `5-Vendas/prospects.csv` no Excel e escolher as 10 primeiras revendas (prioridade A).
7. [ ] Me pedir as prévias: "monta as prévias das revendas A". Eu monto, confiro e publico.
8. [ ] **Mandar as primeiras mensagens** (scripts em `5-Vendas/SCRIPTS-WHATSAPP.md`), até 15 por dia.
9. [ ] Primeira venda → comprar `vitrinemotor.com.br` (R$ 40) e me pedir para apontar o domínio.

## Sobre usar o seu WhatsApp

Eu preparei cada mensagem, mas **quem envia é você**, pelo seu celular. Mandar mensagem em seu nome é algo que só faço com a sua aprovação explícita de cada envio, e o WhatsApp bane números que disparam mensagens automáticas para desconhecidos. Mandando você, à mão, com o texto pronto, leva 1 minuto por revenda e protege o número.

## Como peço as coisas ao Claude depois

- "Monta a prévia da revenda X com este link do Napista: ..."
- "Na Br Kar, entrou um Onix 2020 por 62.900 com estas fotos; vendeu o Kwid."
- "Publica tudo." / "Publica o site oficial da revenda X."
- "Atualiza o plano com os números desta semana: ..."
