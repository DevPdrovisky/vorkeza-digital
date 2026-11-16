# VORKEZA DIGITAL — website comercial (versão 3 — visual premium + animações)

Site estático, responsivo, sem backend, pronto para publicar em hospedagem compatível com HTML/CSS/JS.

## Abrir

Abra `index.html` no navegador. Para testar clipboard e comportamento de publicação em condições reais, use um servidor local (ex.: `python -m http.server 8000`) e acesse http://localhost:8000.

## Antes de publicar — OBRIGATÓRIO

1. **Escolher e confirmar a marca:** "VORKEZA DIGITAL" é provisório. Pesquise anterioridade de marca no INPI e disponibilidade do domínio no Registro.br; resultados em buscadores não garantem exclusividade.
2. **Preencher `config.js`:** inclua o WhatsApp comercial no formato internacional `55` + DDD + número, exclusivamente números. Sem isso, o site permite preparar/copiar mensagem, mas NÃO encaminhar orçamentos nem recebe solicitações.
3. **Confirmar pacotes e preços:** Site Express R$ 790, Profissional R$ 1.390, Cardápio Delivery R$ 1.490 (até 40 itens), Cardápio Completo R$ 2.390 (até 150 itens; exemplo: Casa Modelo) são propostas. O painel administrativo de edição é um ADICIONAL: +R$ 890 no Express (total R$ 1.680), +R$ 1.190 no Profissional (total R$ 2.580), +R$ 1.490 no Delivery (total R$ 2.980), +R$ 1.690 no Completo (total R$ 4.080). Com painel, a partir do 13º mês há mensalidade de R$ 79 (hospedagem, banco de dados, segurança do login e suporte). Valores de entrada condicionados a um componente de gestão padronizado, previamente desenvolvido, testado e dimensionado ao negócio. Não prometer entrega por esses preços se for preciso criar backend de zero. A política de 12 meses de hospedagem deve constar claramente no contrato com limites, infraestrutura e transferência. Serviços de banco de dados, autenticação e armazenamento exigidos pelo painel podem ter custos próprios, mesmo dentro do primeiro ano, discriminados antes do contrato.
4. **Conferir o portfólio:** o projeto exemplo é a Casa Modelo Salgados (https://casa-modelo.vorkeza.com.br/), loja fictícia. Os modelos de barbearia e de empresa e o painel em `demo-painel/` também usam dados fictícios.
5. **Revisar privacidade e contrato:** a página não envia dados para servidores; quando configurado, abre o WhatsApp com a mensagem preparada. Publique sua política de privacidade se passar a coletar dados diretamente.
6. **Registre o domínio em nome do próprio cliente e configure DNS/SSL no provedor escolhido.**

## O que mudou na versão 3

- Hero escuro com brilhos animados, palavra rotativa e vitrine (computador + celular) que flutua e inclina com o mouse.
- Animações de entrada ao rolar, faixa de diferenciais rolando, cartões com efeito de luz, linha do processo que se preenche.
- Chave "Incluir painel de edição" nos preços: os valores somam o painel com contagem animada e já marcam a opção no formulário.
- Menu de celular em tela cheia, barra fixa "Pedir orçamento" no celular, botão voltar ao topo e barra de progresso.
- Botão flutuante de WhatsApp e links de redes no rodapé aparecem sozinhos quando `config.js` estiver preenchido.
- iPhone/Android: campos com 16px (sem zoom ao tocar), área segura do notch, `-webkit-` em efeitos de vidro, selects com seta própria, efeitos de hover só onde existe mouse, respeito a "reduzir movimento".
- Correção: botões "Copiar" e "Enviar pelo WhatsApp" apareciam antes da hora (o atributo `hidden` era anulado pelo CSS).
- Novos arquivos: `assets/og-image.png` (prévia ao compartilhar o link no WhatsApp/redes) e `assets/apple-touch-icon.png` (ícone ao salvar na tela do iPhone).
- Se mudar de domínio, troque a URL nas tags `og:url`, `og:image` e `canonical` do `index.html`.

## Estrutura

- `index.html` — conteúdo e marcação semântica
- `styles.css` — identidade e layout responsivo
- `app.js` — interações (menu, escolha de plano, formulário, cópia, WhatsApp)
- `config.js` — telefone e contatos (vazio por segurança)
- `assets/logo.svg` e `assets/favicon.svg` — marca vetorial (se você já tem o logo oficial da Vorkeza, substitua esses dois arquivos mantendo o nome)
- `assets/og-image.png` e `assets/apple-touch-icon.png` — prévia de compartilhamento e ícone do iPhone

## Publicar em Cloudflare Pages

Conecte um repositório contendo estes arquivos, ou use um método de upload de site estático compatível com o provedor. Nenhum comando de build é necessário. Os arquivos devem ficar na raiz. Depois configure o domínio. Verifique os termos e limites do plano.

## Modelo de atendimento comercial

1. Visitante escolhe um dos planos.
2. Formulário preenche o plano e gera mensagem com briefing.
3. Com `whatsappNumber` configurado, aparece o botão para abrir conversa com a agência. Sem número, o visitante só pode copiar a mensagem — por isso esse ajuste é essencial antes de divulgar.

O formulário não cria leads em banco de dados. Para receber solicitações sem WhatsApp, será necessário integrar um provedor de formulário ou backend e publicar política de privacidade adequada.

## Adicional: painel de edição (modelo padronizado)

- Express + R$ 890: editar textos, fotos, contatos e conteúdos configurados da única página.
- Profissional + R$ 1.190: editar textos e fotos das páginas incluídas.
- Delivery + R$ 1.490: editar produtos, categorias, preços e fotos, mantendo categorias/opções nos limites acordados.

Preços são **adicionais únicos de implantação**, não mensalidades. O painel demanda login seguro e gestão de persistência, autenticação e armazenamento. Custo da infraestrutura de dados e limites de operação devem ser especificados na proposta individual. Não está incluído: sistema de vendas, pagamentos, gestão de pedidos, estoque, relatórios, multiusuários, integrações ou suporte irrestrito. Projetos personalizados são orçados separadamente. É obrigatório testar autorização, backup/restauração e manipulação de fotos antes de entregar ao cliente.
