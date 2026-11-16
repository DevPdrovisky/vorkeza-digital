---
name: vorkeza
description: Vorkeza Digital — fazer o site de um cliente (Site Express, Site Profissional, Cardápio Delivery ou Delivery Pro), alterar ou publicar o site de um cliente, ou mexer no site vorkeza.com.br. Use quando o pedido falar em "site express", "site profissional", "cardápio", "delivery", "delivery pro", "site para cliente da Vorkeza" ou "site da Vorkeza".
---

# Vorkeza Digital — sites de clientes

Pedido típico: **"faça um site express para vorkeza: (dados do cliente) + diferenciais"**.

## 1. Descobrir o plano e o escopo (o escopo é fechado; não passe dele)

| Plano | Preço | Prazo | O que entra |
|---|---|---|---|
| **Site Express** | R$ 790 | 7 dias úteis | 1 página: topo com chamada, serviços, diferenciais, localização (mapa embutido do endereço), WhatsApp, rodapé |
| **Site Profissional** | R$ 1.390 | 10 dias úteis | Até 5 páginas: início, sobre, serviços, galeria, contato. SEO estrutural básico (title, description, og, schema LocalBusiness) |
| **Cardápio Delivery** | R$ 1.490 | 10 dias úteis | Até 40 produtos, categorias, adicionais simples, carrinho no navegador, pedido formatado para o WhatsApp |
| **Delivery Pro** | R$ 2.390 | 15 dias úteis | Até 150 produtos, busca, filtro por categoria, destaques e combos na página inicial, carrinho e pedido pelo WhatsApp |

Todos: responsivo, 2 rodadas de ajustes, hospedagem + domínio .com.br no 1º ano. Pagamento 50% + 50% (Pix, débito ou crédito). Depois do 1º ano: R$ 39/mês. Painel de edição só se o cliente quiser: Simples R$ 79/mês, Completo a partir de R$ 149/mês.

Se o pedido passar do escopo (mais páginas, login, pagamento online, agenda), **avise que é orçamento à parte** e pergunte antes de fazer.

## 2. Montar a pasta do cliente

```
clientes-vorkeza/<slug>/
  cliente.json   plano, nome, ramo, cidade, endereço, whatsapp (55+DDD+número), instagram, cores, diferenciais, modo ("previa" | "oficial"), dominio
  site/          index.html, styles.css, app.js (se precisar), assets/ (logo, fotos em WebP)
```

- `slug`: nome do negócio em minúsculas com hífen (ex.: `dom-navalha-barbearia`).
- Dados que o usuário não deu ficam `null` no JSON e aparecem como **"A confirmar"** no site. **Nunca invente** telefone, endereço, preço, horário, depoimento, nota ou número de clientes.
- Sem foto do cliente: use formas, ícones e cores. Não use foto de banco fingindo ser do cliente.
- Cardápio: os produtos vão em `site/produtos.json` (nome, categoria, preço, descrição, foto, adicionais). Respeite o limite do plano (40 ou 150).

## 3. Visual (para não parecer feito por IA)

- Cores e tom tirados do ramo e do que o usuário mandar. **Sem azul**, a menos que seja a cor da marca do cliente.
- Fontes locais (Manrope e DM Sans em `assets/fontes`, copiadas de `Vitrine Motor/3-Produto/modelo/fontes/`) ou do Google Fonts.
- Pode usar as animações do grupo: copie `grupo/movimento.css` e `grupo/movimento.js` para `site/` (atributos `data-texto`, `data-brilho`, `data-ima`; classes `m-seta`, `m-faisca`). Sempre respeitando `prefers-reduced-motion`.
- Botão de WhatsApp com mensagem pronta (`https://wa.me/<numero>?text=...`).
- Rodapé: "Site feito pela Vorkeza Digital" com link para https://vorkeza.com.br.
- Em `modo: "previa"`: faixa no topo "Prévia feita pela Vorkeza Digital" e `<meta name="robots" content="noindex">`.

## 4. Conferir antes de mostrar

1. Abrir com preview_start `cliente-vorkeza` (porta 8500) em http://localhost:8500/<slug>/site/ e conferir em 1440px e 375px com `pack-instagram-src/conferir-site.js`.
2. Sem erros no console, sem rolagem horizontal, todos os links do WhatsApp com o número certo.
3. Cardápio: testar adicionar ao carrinho e ver a mensagem do pedido.
4. Mandar print ao usuário (SendUserFile).

## 5. Publicar (só com o "pode publicar" do usuário)

```powershell
.\ferramentas\publicar-cliente.ps1 <slug>
```

Vai para o projeto Cloudflare `vz-<slug>` (`https://vz-<slug>.pages.dev`). O domínio do cliente é o usuário quem registra e aponta (Custom domains no painel da Cloudflare).

## Mudanças pequenas depois ("troca o telefone", "muda o preço da coxinha")

Altere só os arquivos de `clientes-vorkeza/<slug>/`, confira e peça OK para publicar. **Não mexa** no site vorkeza.com.br nem nas outras marcas.

## Site vorkeza.com.br (o site de vendas da Vorkeza)

Arquivos na raiz: `index.html`, `styles.css`, `app.js`, `config.js`, `assets/`. Preços ficam em 3 lugares que precisam bater: cards de preço no `index.html`, `planPricing` no `app.js` e as perguntas frequentes. Publicar: `.\publicar.ps1` na raiz (só com OK).
