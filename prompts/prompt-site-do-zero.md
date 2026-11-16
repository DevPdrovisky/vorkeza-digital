# Prompt — site novo do zero, no padrão Vorkeza

> Como usar: copie tudo a partir de "INÍCIO DO PROMPT", preencha a **Ficha do projeto** e cole numa conversa nova
> (Claude Code, Claude ou outra IA). Funciona sem acesso às pastas da Vorkeza: tudo que importa está aqui.

---

## INÍCIO DO PROMPT

Você vai criar **do zero** um site de uma página (landing page) para um pequeno negócio, no padrão de qualidade da
Vorkeza Digital: rápido, bonito, cheio de animação com propósito e que **não parece feito por IA nem por template**.
Responda e escreva o site em **português do Brasil**, com palavras simples.

### 1. Ficha do projeto (preencha; o que não souber, deixe em branco)

- Nome do negócio:
- Ramo (ex.: oficina, barbearia, restaurante, clínica):
- Cidade / bairro / endereço completo:
- WhatsApp (55 + DDD + número):
- Instagram:
- Horário de funcionamento:
- Serviços / produtos (com preço só se eu informar):
- Diferenciais:
- Cores da marca (ou "tire da logo"):
- Logo / fotos que vou mandar:
- É prévia ou site oficial? (prévia = faixa "Prévia" no topo e `noindex`)

**Regra de ouro dos dados:** nunca invente telefone, endereço, preço, horário, nota, número de clientes, avaliações
ou depoimentos. O que faltar aparece no site como **"A confirmar"** (e no código fica `null`). Demonstrações usam dados
claramente fictícios, com aviso. Sem foto real, use ícones, formas, ilustração em SVG e cor — nunca foto de banco
fingindo ser do cliente.

### 2. Tecnologia (simples e sem dependência)

- HTML + CSS + JavaScript puro. **Sem framework, sem jQuery, sem biblioteca de animação**, sem build.
- Arquivos: `index.html`, `styles.css`, `app.js`, `movimento.css`, `movimento.js`, `assets/` (logo, imagens em WebP,
  `og.jpg` 1200×630, fontes em `assets/fontes/`).
- Fontes locais em WOFF2: **Manrope** (títulos, 700–800) e **DM Sans** (texto, 400–700), com `font-display: swap`.
- Ícones em **SVG inline** (traço 2–2.2px, cantos arredondados), nada de fonte de ícones nem emoji como ícone.
- Tem que abrir rápido no 4G: imagens com `width/height`, `loading="lazy"` abaixo da dobra, nada acima de ~200 KB por imagem.

### 3. Estrutura da página (nesta ordem, adapte os nomes ao ramo)

1. **Cabeçalho fixo**: logo, menu com âncoras, botão de WhatsApp. Fica com fundo desfocado ao rolar; barra fina de
   progresso de leitura no topo; no celular o menu vira pílulas roláveis ou botão de menu.
2. **Topo (hero)**: título forte com uma **palavra que troca** (ex.: "Site pronto para *barbearias / restaurantes…*"),
   subtítulo de uma linha, 2 botões (principal + secundário), 3 selos curtos com check, e uma peça visual animada do
   ramo à direita (no celular vai para baixo).
3. **Faixa de diferenciais**: NÃO use letreiro que rola infinito (já está batido). Crie uma peça própria do ramo —
   exemplos que já usamos e **não devem ser repetidos**: barra de navegador que digita endereço + selo "No ar"; painel
   de letras que viram (flip-board) com conta-giros. Invente outra.
4. **Serviços**: cartões com ícone, título, frase curta e link. Cartões com luz que segue o mouse.
5. **Peça interativa do ramo** (o "uau" do site): algo que o visitante toca e aprende. Ex. oficina: carro que entra
   freando, scanner passa e acende pontos clicáveis ("Freios", "Suspensão"…), e no celular os nomes viram uma legenda
   numerada abaixo. Barbearia: navalha desenhando o corte. Restaurante: prato montando por camadas. Tem que ser útil,
   não só enfeite.
6. **Ferramentas úteis para o cliente do negócio** (escolha 2–3 que façam sentido): agendamento que monta a mensagem
   no WhatsApp (dias úteis + horários, gera arquivo `.ics` de lembrete), calculadora/lembrete (ex.: próxima troca de
   óleo), "o que significa esta luz do painel", indicar para um amigo (compartilhar), cardápio com carrinho.
7. **Como funciona / passo a passo** em 3–4 etapas numeradas.
8. **Endereço**: endereço escrito, mapa embutido (iframe sem chave) e botões de rota (Waze e mapas). Foto da fachada
   se eu mandar.
9. **Perguntas frequentes** em acordeão com abertura suave.
10. **Chamada final** + **rodapé** (contatos, horários, "Site feito pela Vorkeza Digital" com link para
    https://vorkeza.com.br, ano automático).
11. **Botões flutuantes**: WhatsApp (com mensagem pronta `https://wa.me/<numero>?text=...`) e voltar ao topo.

### 4. Visual

- Paleta tirada da marca/logo do cliente, definida em variáveis no `:root` (`--ink`, `--ac`, `--ac-forte`, `--papel`,
  `--texto`, `--suave`, `--linha`, `--raio`, `--sombra`, `--ease: cubic-bezier(.2,.7,.2,1)`).
  **Sem azul** a menos que seja a cor da marca do cliente. Nada de logo, cores ou visual do Google.
- Contêiner: `width: min(1180px, 100% - 64px); margin-inline: auto;` (no celular `100% - 32px`).
- Seções alternando fundo claro e escuro; títulos grandes com `clamp()`, letter-spacing levemente negativo;
  rótulo pequeno em caixa alta acima de cada título ("01 — SERVIÇOS").
- Cantos 12–20px, sombras suaves e coloridas na cor da marca, bordas de 1px bem claras.
- Nada de gradiente arco-íris, nada de fundo roxo genérico "de IA", nada de ilustração 3D de banco.

### 5. Animações (o coração do padrão)

Princípios: **toda animação tem motivo** (mostrar, guiar ou responder ao toque), dura 0,3–1,2 s, usa só `transform`,
`opacity` e `filter` (rodam suaves no celular) e **nunca atrapalha a leitura**.

Monte um `movimento.js` + `movimento.css` próprios, ligados por atributos no HTML:
- `data-texto="h1, main h2"` → títulos entram palavra por palavra saindo do desfoque.
- `[data-m-rolagem]` → frase grande que "acende" palavra por palavra conforme a rolagem.
- `data-brilho=".cartao"` → luz que segue o mouse dentro do cartão + borda acesa.
- `data-ima=".btn-grande"` → botão que puxa levemente para o mouse.
- `[data-m-tilt]` → cartão que inclina na direção do mouse com reflexo.
- `[data-m-conta]` → número que conta até o valor quando aparece (só números reais!).
- `[data-m-digita]` → balão de mensagem: "digitando…" vira o texto.
- `.m-seta` → seta do botão que troca com desfoque; `.m-faisca` → faíscas no clique.
- Entradas ao rolar com **um único IntersectionObserver** (classe `.m-in`), em cascata leve.

Regras técnicas obrigatórias:
- `prefers-reduced-motion: reduce` → tudo parado e visível, sem esconder conteúdo.
- Efeitos de mouse só com `(hover: hover) and (pointer: fine)`.
- Sem JavaScript o conteúdo continua todo visível (classe `m-js` no `<html>` liga as animações).
- **Aba em segundo plano:** animações com `setInterval`/`setTimeout` param em `document.hidden` e recomeçam
  limpas no `visibilitychange` (senão as trocas se acumulam e ficam palavras/cartões empilhados quando a pessoa volta).
  Use um ciclo encadeado com uma lista de timers que é limpa, nunca vários `setInterval` soltos.
- Palavra que troca no topo: remova as palavras antigas antes de inserir a nova (nunca deixe duas no DOM).
- Peças que só servem de enfeite levam `aria-hidden="true"`; a informação real fica em texto acessível.
- Nada de texto com contorno (`-webkit-text-stroke`) em letreiros: aparecem riscos nas letras. Use preenchimento sólido.

### 6. SEO e compartilhamento

- `<title>` "Nome — o que faz | Cidade – UF", `meta description` de ~150 caracteres, `canonical`, Open Graph
  (`og:title`, `og:description`, `og:image` 1200×630), `theme-color`, favicon.
- JSON-LD `LocalBusiness` (ou o tipo do ramo, ex. `AutoRepair`) só com dados reais.
- `robots.txt` e `sitemap.xml` no site oficial; na prévia, `<meta name="robots" content="noindex">` e faixa no topo
  "Prévia feita pela Vorkeza Digital".
- Hierarquia correta: um `h1`, `h2` por seção, `alt` em todas as imagens, contraste AA, foco visível no teclado.

### 7. Conferir antes de entregar

1. Abrir em 1440×900 e 375×812 (e 360 de largura): sem rolagem horizontal, nada encavalado, textos legíveis,
   nomes e legendas visíveis também no celular.
2. Console sem erros.
3. Todos os links do WhatsApp com o número certo e a mensagem pronta.
4. Testar cada ferramenta (agendamento, calculadora, carrinho) de ponta a ponta.
5. Deixar a aba em segundo plano por alguns minutos e voltar: nenhuma animação empilhada.
6. Com "reduzir movimento" ligado: tudo aparece parado e completo.
7. Mostrar prints do computador e do celular.

### 8. Referência de qualidade: o site da Auto Mecânica Coco

Use como régua (o nível de "uau" e de utilidade), **não como molde para copiar**. O que ele tem e por que funciona:

| Peça | Como é | Por que funciona |
|---|---|---|
| Barra de progresso | a barra de leitura do topo é um **pneu** rodando | detalhe do ramo em algo que todo site tem |
| Engrenagem no topo | engrenagem girando atrás do título | dá vida sem roubar atenção |
| Placa da oficina | letras que **viram uma a uma** (flip-board) formando o nome, com um **conta-giros** que acelera a cada troca | substitui o letreiro rolante por algo do mundo do cliente |
| Check-up do carro | o carro entra freando (desfoque + leve "tranco"), riscos de velocidade, rodas girando, farol piscando; um **scanner** de luz passa e acende 5 pontos clicáveis (Revisão, Motor, Óleo, Suspensão, Freios); no fim, selo "Check-up completo" | é a peça "uau", e cada ponto leva ao serviço. No celular os pontos ganham **números** e uma **legenda** abaixo acende junto |
| Horário de hoje | mostra "Aberto agora / Fecha às 18h / Fechado" pelo horário de Brasília | informação útil em tempo real |
| Agendamento | escolhe serviço, dia (próximos dias úteis, sábado com menos horários) e hora → monta a mensagem no WhatsApp + baixa `.ics` de lembrete | vira ferramenta de trabalho do dono |
| Luzes do painel | ícones das luzes do painel do carro; tocar explica o que significa e se pode rodar | conteúdo que o cliente procura e que gera confiança |
| Calculadora de óleo | digita o km da última troca e o de hoje, escolhe o intervalo → barra enche e diz quanto falta (ou quanto passou); o botão já leva ao WhatsApp com os km na mensagem | traz o cliente de volta na hora certa |
| Ícones dos serviços | cada ícone tem uma micro-animação própria (ponteiro que sobe, mola que comprime, gota que cai, peça que treme) | mostra cuidado nos detalhes |
| Endereço | endereço escrito + mapa embutido + botões de rota | resolve "como chego" em um toque |
| Indicar | botão que abre o compartilhar do celular com uma frase pronta; no computador copia frase + link | boca a boca digital |

Para o novo projeto, faça a **versão do ramo** de cada ideia: qual é o "pneu", a "placa", o "check-up", as "luzes do
painel" e o "lembrete de óleo" desse negócio? Ex. barbearia: progresso como navalha, scanner no rosto mostrando
cortes, lembrete "faz 3 semanas do último corte". Restaurante: progresso como prato enchendo, montagem do prato,
"aberto agora" e pedido pelo WhatsApp.

### 9. O que NÃO fazer

- Não inventar dado do cliente (fica "A confirmar").
- Não copiar peças de outros sites que você já fez: cada cliente ganha animação e faixa próprias do ramo.
- Não usar biblioteca pesada, carrossel automático, popup, vídeo de fundo pesado ou som.
- Não publicar nem mandar mensagem por mim: prepare tudo e eu publico/envio.
- Não passar do escopo combinado sem me avisar (login, pagamento online e sistemas são orçamento à parte).

Comece me mostrando em poucas linhas: a paleta escolhida, a ideia da faixa de diferenciais, a peça interativa do ramo
e as ferramentas úteis. Depois construa o site completo.

## FIM DO PROMPT
