# Fura-Fila de Aluguéis

Gera o **Dossiê do Inquilino**: um currículo de locatário em PDF, com visual executivo, vendido por **R$ 29,90**.
Cada PDF leva no rodapé de todas as páginas o convite para imobiliárias conhecerem a **Vitrine Imóvel** (estratégia "Cavalo de Troia": o inquilino entrega o documento ao corretor, o corretor vira lead B2B).

Stack: Next.js 16 (App Router) · React 19 · Tailwind 4 · Stripe Checkout · Supabase (Postgres, Storage, Auth) · @react-pdf/renderer + pdf-lib.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000. **Sem nenhuma variável de ambiente** o app roda em modo demonstração:
banco em memória (some ao reiniciar) e pagamento simulado (botão "Simular pagamento" no paywall).
Em desenvolvimento, `/api/pdf-exemplo` mostra um PDF de exemplo.

## Variáveis de ambiente

Copie `.env.example` para `.env.local`:

| Variável | Onde pegar |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site (ex.: `https://furafila.com.br`) |
| `STRIPE_SECRET_KEY` | Stripe › Desenvolvedores › Chaves de API |
| `STRIPE_WEBHOOK_SECRET` | `stripe listen` (local) ou o endpoint de webhook (produção) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase › Project Settings › API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | idem |
| `SUPABASE_SERVICE_ROLE_KEY` | idem — **somente servidor** |
| `SUPABASE_BUCKET_COMPROVANTES` | nome do bucket (padrão `comprovantes`) |
| `NEXT_PUBLIC_VITRINE_IMOVEL_URL` | destino do link B2B (padrão `https://vitrineimovel.pages.dev/`) |

Em produção, Supabase e Stripe são obrigatórios (o app recusa o modo demonstração).

## Supabase

1. Crie o projeto e rode `supabase/schema.sql` no SQL Editor (tabelas, RLS e bucket privado).
2. Authentication › URL Configuration: adicione `https://SEU_DOMINIO/auth/confirmar` (e `http://localhost:3000/auth/confirmar`) em Redirect URLs.
3. Para o link mágico funcionar em outro aparelho, edite o modelo "Magic Link" para:
   `{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=email&next=/meus-dossies`
4. Configure um SMTP próprio (Resend, SES…): o SMTP padrão do Supabase tem limite baixíssimo de envios.

## Stripe

1. Ative **Cartão** e **Pix** em Configurações › Métodos de pagamento (o Checkout usa métodos dinâmicos).
2. Webhook local:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Produção: crie o endpoint `https://SEU_DOMINIO/api/webhooks/stripe` com os eventos
   `checkout.session.completed`, `checkout.session.async_payment_succeeded` e `checkout.session.async_payment_failed`.

A página `/sucesso` também confirma o pagamento direto na API do Stripe, então o download é liberado mesmo se o webhook atrasar. A marcação como pago é idempotente.

## Fluxo

`/` landing → `/criar` formulário (uma pergunta por tela) → análise (3 s) → paywall → Stripe Checkout →
`/sucesso` (download do PDF) · `/dossie/[id]` link privado do dossiê · `/verificar/[codigo]` autenticidade pública (com CTA B2B) · `/entrar` + `/meus-dossies` acesso por link mágico.

## Estrutura

```
src/
  app/            páginas e rotas de API (checkout, webhooks/stripe, dossie/[id]/…)
  components/     UI (formulário, paywall, prévia do documento)
  lib/            regras do dossiê, validação (zod), repositório (Supabase/memória), Stripe
  pdf/            template do PDF (DossiePDF.tsx), geração e anexos (gerar.tsx), fontes
supabase/schema.sql
```

O rodapé obrigatório está em `src/lib/config.ts` (`RODAPE_B2B`) e é renderizado como elemento fixo em todas as páginas do PDF, inclusive nas páginas de anexos.

## LGPD

- Consentimento explícito antes de enviar (gravado em `aceite_em`).
- Comprovantes ficam em bucket privado, lidos só pelo servidor; o dossiê é acessado por link com UUID.
- A página de verificação mostra apenas nome, data e código — nada de renda ou documentos.
- Defina uma política de retenção (ex.: apagar comprovantes após 90 dias) e publique a política de privacidade antes do lançamento.

## Deploy

Vercel (ou qualquer host Node): configure as variáveis, aponte o webhook e defina `NEXT_PUBLIC_SITE_URL`.
As fontes do PDF são incluídas no bundle pelas rotas de API via `outputFileTracingIncludes` (next.config.ts).
