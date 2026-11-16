# Prompt — micro SaaS do zero, no padrão Vorkeza

> Como usar: copie tudo a partir de "INÍCIO DO PROMPT", preencha a **Ficha do produto** e cole numa conversa nova
> (Claude Code, Claude ou outra IA). Funciona sem acesso às pastas da Vorkeza: tudo que importa está aqui.
> (Para site de cliente comum, use `prompt-site-do-zero.md`.)

---

## INÍCIO DO PROMPT

Você vai criar **do zero** um **micro SaaS**: um produto online pequeno, que resolve **um** problema bem resolvido
para um público específico, cobrado por assinatura mensal. São duas partes:

1. **Página de venda** (landing) no padrão de qualidade da Vorkeza Digital: rápida, bonita, com animação que explica
   o produto e que **não parece feita por IA nem por template**.
2. **O aplicativo** (o produto em si): cadastro, login, a função principal, plano grátis/teste e assinatura.

Responda e escreva tudo em **português do Brasil**, com palavras simples. Eu não sou programador: explique cada passo
que depende de mim (criar conta, colocar chave, publicar) em linguagem de leigo.

### 1. Ficha do produto (preencha; o que não souber, deixe em branco)

- Nome do produto:
- Problema que resolve (uma frase):
- Para quem é (ex.: oficinas, barbearias, corretores, lojas de roupa):
- A **uma** coisa principal que o usuário faz no app:
- Como ele faz isso hoje sem o produto (papel, WhatsApp, planilha…):
- Preço pensado (ex.: R$ 29/mês) e se terá plano grátis ou teste de X dias:
- Cores / logo (ou "crie uma identidade"):
- Domínio (se já tiver):
- Concorrentes que conheço:

**Regra de ouro dos dados:** nunca invente números de clientes, depoimentos, notas, "mais de 1.000 empresas usam",
logos de clientes ou resultados. Sem dado real, não aparece (ou fica "A confirmar"). Demonstrações e telas de exemplo
usam dados **claramente fictícios**, com aviso "dados de exemplo".

### 2. Antes de programar: me mostre o plano (e espere meu OK)

Em poucas linhas:
1. **O problema e o "momento uau"**: o que o usuário consegue fazer nos primeiros 2 minutos que o faz pensar "isso me
   ajuda". O produto inteiro gira em volta disso.
2. **Escopo do MVP**: no máximo 3–5 telas. Liste o que **fica de fora** da primeira versão.
3. **Modelo de cobrança**: grátis com limite ou teste de X dias → plano pago. Um plano só no começo (no máximo dois).
4. **Telas** (rascunho em texto) e **dados** que serão guardados.
5. Ideia visual: paleta, a peça animada da página de venda e a demo interativa.

### 3. Tecnologia (simples, barata e fácil de manter)

- **Next.js (App Router) + TypeScript**, CSS próprio (variáveis no `:root`) ou CSS Modules. Sem biblioteca de animação:
  animações em CSS + JS leve.
- **Banco e login**: Supabase (Postgres + autenticação por e-mail com link mágico/código; login social opcional).
  Regras de acesso (RLS) ligadas: cada usuário só vê os próprios dados.
- **Pagamento**: provedor com **Pix e cartão** e assinatura recorrente (ex.: Mercado Pago, Asaas ou Stripe), sempre
  começando em **modo de teste**. Webhook para ativar/cancelar o plano. Nunca guardar dados de cartão.
- **E-mails** transacionais (boas-vindas, cobrança, recuperação): Resend ou o do próprio Supabase.
- **Hospedagem**: Vercel ou Cloudflare Pages. Variáveis secretas só em `.env.local` (com `.env.example` sem valores).
- Fontes locais em WOFF2: **Manrope** (títulos) e **DM Sans** (texto). Ícones em **SVG inline**.
- Código organizado e comentado em português nos pontos importantes; `README.md` com "como rodar", "como publicar"
  e "onde trocar preço/textos".

**Quem faz o quê:** criar contas (Supabase, pagamento, hospedagem, domínio), colocar chaves, aceitar termos,
pagar e publicar é comigo. Você prepara tudo e me diz exatamente onde clicar e o que copiar.

### 4. Página de venda (landing)

Ordem das seções:
1. **Cabeçalho fixo**: logo, âncoras, "Entrar" e botão principal ("Começar grátis"). Fundo desfocado ao rolar e barra
   fina de progresso de leitura.
2. **Topo**: título com o resultado (não a função): "Pare de ___ / Tenha ___ em 2 minutos", com uma **palavra que
   troca** mostrando os públicos ("para *oficinas / barbearias / lojas*"). Subtítulo de uma linha, botão principal +
   "Ver como funciona", 3 selos curtos (ex.: "Sem cartão para testar", "Cancela quando quiser", "Funciona no celular").
   À direita, **o app de verdade em miniatura, animado** (a tela principal se preenchendo sozinha).
3. **Faixa de prova de valor**: NÃO use letreiro rolando infinito. Crie uma peça própria do produto — exemplos já
   usados e que **não devem ser repetidos**: barra de navegador digitando endereço + selo "No ar"; placa de letras que
   viram com conta-giros. Invente outra (ex.: contador "antes × depois" do tempo gasto).
4. **O problema**: 3 dores do público, com a frase grande que "acende" palavra por palavra na rolagem.
5. **Demo interativa** (o "uau"): o visitante mexe numa versão de brinquedo do app, sem cadastro, com dados de
   exemplo. Tem que mostrar o "momento uau" em segundos.
6. **Como funciona** em 3 passos numerados.
7. **Recursos**: cartões com ícone animado próprio e luz que segue o mouse — só o que existe no MVP.
8. **Calculadora de economia** (se fizer sentido): "quantas horas/R$ você perde por mês" → resultado animado.
   Fórmula explicada, sem promessa exagerada.
9. **Preço**: cartão(ões) com valor que conta até o número, o que inclui, "teste grátis" e formas de pagamento
   (Pix, cartão de débito ou crédito). Sem fidelidade, cancela no painel.
10. **Perguntas frequentes** em acordeão (segurança dos dados, cancelamento, suporte, celular, LGPD).
11. **Chamada final** + **rodapé** (termos de uso, privacidade, contato, "Feito pela Vorkeza Digital" com link para
    https://vorkeza.com.br, ano automático).
12. Botão flutuante de **suporte pelo WhatsApp** com mensagem pronta.

### 5. O aplicativo

- **Cadastro em 1 passo** (e-mail → código/link). Depois, **onboarding** de no máximo 3 perguntas que já deixa o app
  configurado, e o usuário cai direto no "momento uau" (nada de painel vazio).
- **Estado vazio caprichado**: ilustração SVG + uma ação clara + opção "usar dados de exemplo".
- **Tela principal** focada na função central. Tudo funciona bem no **celular** (o público usa mais o celular).
- **Configurações**: dados do negócio, plano e cobrança (ver, trocar, cancelar), sair, **excluir conta e dados**
  (LGPD).
- **Limites do plano grátis** mostrados com barra ("3 de 10 usados") e convite para assinar no momento certo, sem
  bloquear de surpresa.
- **Compartilhar pelo WhatsApp** onde fizer sentido (link público de algo gerado no app = divulgação grátis do produto).
- Mensagens de erro humanas ("Não deu para salvar. Confira sua internet e tente de novo."), carregamentos com esqueleto
  (skeleton), confirmação antes de apagar, desfazer quando possível.
- Painel simples para mim (admin): número de cadastros, ativos, pagantes e cancelamentos.

### 6. Visual

- Paleta definida em variáveis no `:root` (`--ink`, `--ac`, `--ac-forte`, `--papel`, `--texto`, `--suave`, `--linha`,
  `--raio`, `--sombra`, `--ease: cubic-bezier(.2,.7,.2,1)`). **Sem azul**, a menos que eu peça. Nada de logo, cores
  ou visual do Google.
- Landing com seções alternando claro e escuro; títulos grandes com `clamp()` e letter-spacing levemente negativo;
  rótulo pequeno em caixa alta acima de cada título ("01 — COMO FUNCIONA").
- App mais calmo que a landing: mesmas cores e fontes, menos movimento, muito espaço, botões grandes.
- Cantos 12–20px, sombras suaves coloridas, bordas de 1px claras.
- Nada de gradiente arco-íris, fundo roxo genérico "de IA", ilustração 3D de banco ou mockup de iPhone genérico.

### 7. Animações (o coração do padrão)

Princípios: **toda animação tem motivo** (mostrar, guiar ou responder ao toque), dura 0,3–1,2 s, usa só `transform`,
`opacity` e `filter` e **nunca atrapalha a leitura**.

Na landing, crie um módulo de movimento ligado por atributos/classes:
- títulos entrando palavra por palavra saindo do desfoque;
- frase que "acende" palavra por palavra na rolagem;
- luz que segue o mouse nos cartões + borda acesa;
- botão principal que puxa levemente para o mouse; seta que troca com desfoque; faíscas no clique;
- cartão que inclina com o mouse (na miniatura do app);
- números que contam até o valor (só números reais: preço, resultado da calculadora);
- balão de mensagem "digitando…" que vira o texto;
- entradas ao rolar com **um único IntersectionObserver**, em cascata leve.

No app: microinterações discretas (botão que confirma com check, item que entra deslizando, barra de limite que enche).

Regras técnicas obrigatórias:
- `prefers-reduced-motion: reduce` → tudo parado e visível.
- Efeitos de mouse só com `(hover: hover) and (pointer: fine)`.
- **Aba em segundo plano:** animações com timers param em `document.hidden` e recomeçam limpas no
  `visibilitychange` (senão as trocas se acumulam e aparecem palavras/cartões empilhados quando a pessoa volta).
  Use um ciclo encadeado com lista de timers limpável, nunca vários `setInterval` soltos.
- Palavra que troca: remova a antiga antes de inserir a nova (nunca duas no DOM).
- Enfeites com `aria-hidden="true"`; a informação real fica em texto acessível.
- Nada de texto com contorno (`-webkit-text-stroke`): aparecem riscos nas letras.
- No celular, rótulos que não cabem em cima de uma imagem viram **legenda numerada** abaixo dela.
- **Miniatura do app no topo**: monte num "palco" de tamanho fixo e escale proporcionalmente via JS (`transform: scale`
  pela largura disponível), para ficar idêntica em qualquer tela e nunca quebrar no celular.
- **Brilho que passa pelo botão principal** (faixa de luz diagonal atravessando de tempos em tempos).
- **Perguntas frequentes**: abrir/fechar animando a altura real do conteúdo (medida via JS), sem pulo e sem cortar texto.
- **Animações pesadas só começam quando aparecem na tela** (IntersectionObserver) e não rodam fora dela.

### 7.1 Depois de publicar

Conferir o endereço **no ar** (não só local): abrir com `?v=<aleatório>` para fugir do cache, checar se o título, os
textos novos e as animações estão lá. A atualização pode levar alguns segundos para chegar em todo lugar: se aparecer
a versão antiga, esperar um pouco e conferir de novo antes de dizer que está pronto.

### 8. Referência de qualidade (régua, não molde)

O site da Auto Mecânica Coco (feito pela Vorkeza) é o nível esperado de "uau" + utilidade. Traduza as ideias para o
produto, **sem copiar**:

| No site do Coco | Ideia por trás | Versão no micro SaaS |
|---|---|---|
| Barra de progresso em forma de **pneu** | detalhe do ramo em algo comum | progresso/carregamento com um símbolo do produto |
| Placa com letras que **viram** + conta-giros | faixa própria em vez de letreiro | faixa de prova de valor própria do produto |
| **Check-up do carro**: carro entra freando, scanner acende pontos clicáveis, selo "completo" | a peça "uau" explica o serviço | demo interativa mostrando o "momento uau" |
| **Agendamento** que monta a mensagem no WhatsApp + lembrete `.ics` | ferramenta de trabalho de verdade | a função principal do app, simples assim |
| **Calculadora de óleo** (km → quanto falta → botão já com os dados) | traz o cliente de volta | calculadora de economia / lembretes que trazem o usuário de volta |
| **Horário de hoje** ("Aberto agora") | informação viva | painel que mostra o estado de hoje logo de cara |
| Botão **indicar** (compartilhar com frase pronta) | boca a boca digital | link compartilhável gerado pelo app + indicação |

### 9. Segurança, LGPD e confiança

- Termos de uso e política de privacidade simples (rascunho para eu revisar), aviso de cookies só se usar cookie não
  essencial.
- Senhas/chaves nunca no código nem no navegador; validação no servidor; RLS no banco; limite de tentativas no login.
- Backup automático do banco ligado; exportar meus dados (CSV) disponível para o usuário.
- SEO da landing: `<title>`, `description`, Open Graph (imagem 1200×630), `canonical`, `robots.txt`, `sitemap.xml`,
  JSON-LD `SoftwareApplication` (sem nota/avaliações inventadas). App com `noindex`.

### 10. Conferir antes de entregar

1. Landing e app em 1440×900, 375×812 e 360 de largura: sem rolagem horizontal, nada encavalado.
2. Console sem erros; `npm run build` sem erros nem avisos de tipo.
3. Fluxo completo em modo de teste: cadastro → onboarding → "momento uau" → limite do grátis → assinatura (cartão de
   teste do provedor) → webhook ativa o plano → cancelar → plano volta ao grátis.
4. Um usuário não consegue ver dados de outro (testar com duas contas).
5. Aba em segundo plano por alguns minutos: nenhuma animação empilhada. "Reduzir movimento" ligado: tudo parado e
   completo.
6. Lighthouse da landing no celular: desempenho, acessibilidade e SEO acima de 90.
7. Mostrar prints do computador e do celular e um resumo do que falta eu fazer (contas, chaves, domínio).

### 11. O que NÃO fazer

- Não inventar números, depoimentos ou logos de clientes.
- Não encher o MVP de recursos: uma função principal muito bem feita.
- Não copiar peças de outros sites que você já fez.
- Não usar biblioteca pesada, carrossel automático, popup de saída, vídeo de fundo pesado ou som.
- Não criar contas, pagar, publicar, colocar chave real nem mandar mensagem por mim: prepare tudo e eu faço.
- Não ativar cobrança real sem eu pedir; tudo começa em modo de teste.

Comece pelo item 2 (o plano) e espere meu OK antes de programar.

## FIM DO PROMPT
