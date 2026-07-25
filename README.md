# Gabi Bijus 🌞

Site da **Gabi Bijus** — bijuterias artesanais feitas à mão no Rio de Janeiro.
Vitrine pública + painel admin, com carrinho e finalização de pedido via WhatsApp (`wa.me`).

E-commerce completo de verdade, em produção, com custo mensal zero (free tier
de ponta a ponta).

## Destaques técnicos

- **Segurança em camadas** — Row Level Security no Postgres em todas as tabelas
  (leitura pública só do que é público, escrita só de admin), painel protegido
  no servidor (`proxy.ts`), validação de toda entrada com zod, rate limiting no
  login, CSP e headers de segurança.
- **Dois clientes Supabase** — site público lê **sem cookies** (páginas
  cacheadas via ISR, revalidadas na hora quando o admin salva); painel usa
  sessão. Detalhe que faz a diferença entre um site rápido e um lento.
- **Painel administrativo completo** em português, pensado para quem não é
  técnica: produtos com upload e reordenação de fotos, categorias, campanhas,
  cupons, e todo o conteúdo do site editável sem tocar em código.
- **Carrinho → WhatsApp** com cupons (validados no servidor sem expor a lista),
  cálculo de frete real via API do Melhor Envio e persistência em `localStorage`.
- **SEO e performance** — sitemap e robots dinâmicos, Open Graph, schema.org
  `Product`, imagens otimizadas via `next/image`.
- **Identidade visual autoral** — sem template: onda do calçadão, carimbo
  giratório, tipografia editorial, tokens de design centralizados.

## Stack

- **Next.js (App Router) + TypeScript + Tailwind CSS v4**
- **Supabase** — Postgres, Auth, Storage (free tier)
- **Vercel** — deploy (plano hobby)

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com os valores do Supabase
npm run dev
```

Abra http://localhost:3000.

## Onde trocar a identidade visual

Todos os tokens vivem em **`src/app/globals.css`** (bloco `@theme`):

| O que          | Onde                                                    |
| -------------- | ------------------------------------------------------- |
| Cores          | `--color-*` em `src/app/globals.css`                     |
| Fontes         | `src/app/layout.tsx` (Fraunces + Archivo via next/font) |
| Raios de borda | `--radius-card` / `--radius-card-lg` em `globals.css`   |
| Logo           | placeholder tipográfico até o arquivo final ser entregue |

Trocar um hex no `@theme` atualiza o site inteiro — nenhuma cor é hardcoded nos componentes.

## Variáveis de ambiente

Veja [.env.example](.env.example):

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — projeto Supabase (apenas a anon key pública vai para o browser).
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — número com DDI (ex.: `5521999999999`).
  Opcional: o número oficial vem do banco (painel → Conteúdo do site).
  **Enquanto nenhum estiver configurado**, o pedido abre o WhatsApp com a
  mensagem pronta, sem destinatário — útil para testes.
- `NEXT_PUBLIC_SITE_URL` — URL pública do site em produção
  (ex.: `https://gabibijus.vercel.app`). Usada no sitemap, SEO e schema.org.

## Como o site lê e atualiza os dados

- **Site público** (`src/lib/data.ts`) usa `supabase/public.ts` — cliente
  **sem cookies**, o que permite às páginas serem cacheadas (ISR, 5 min).
- **Painel** usa `supabase/server.ts` (com sessão em cookies) e, a cada
  alteração, chama `revalidarSitePublico()` — a loja reflete a mudança na hora.
- Nunca use o cliente com cookies no site público: isso força toda página a ser
  dinâmica e derruba a performance.

## Frete (Melhor Envio)

- `MELHOR_ENVIO_TOKEN` (secreto, só servidor) — gerar em
  melhorenvio.com.br → Painel → Integrações → Tokens (permissão
  `shipping-calculate`).
- CEP de origem, pacote padrão e **transportadoras exibidas**: painel →
  **Configurações → Entrega** (só Correios por padrão — marque outras apenas
  se a loja realmente conseguir postar por elas).
- Sem token, a calculadora simplesmente não aparece no carrinho.

## Cupons

- Migração `supabase/migrations/0003_cupons.sql` cria a tabela `coupons` e a
  função `validar_cupom` (a lista de cupons nunca é exposta publicamente).
- Gerenciados no painel → **Cupons** (% ou R$, pedido mínimo, validade,
  pausar/ativar).

## Segurança

- **RLS** em todas as tabelas (leitura pública só do que é público; escrita
  exclusiva de admins) — testado com requisições diretas à API.
- **Headers**: CSP, X-Frame-Options DENY, nosniff, Referrer-Policy e
  Permissions-Policy em todas as rotas (`next.config.ts`).
- **Login**: mensagens genéricas + rate limiting em memória (5 tentativas/min
  por IP — melhor esforço em serverless, somado ao rate limit do Supabase).
- **Backups**: o Supabase (free) mantém backup diário do banco. Para restaurar:
  Dashboard → Database → Backups → Restore.

## Roadmap (etapas)

- [x] **Etapa 0 — Fundação:** projeto, design tokens, tipografia, estrutura
- [x] **Etapa 1 — Home** (hero bento, marquee, destaques, footer) — dados mockados
- [x] **Etapa 2 — Catálogo + produto + carrinho** (localStorage + `wa.me`)
- [x] **Etapa 3 — Banco de dados** (Supabase com RLS completo, seed aplicado,
  site lendo do banco via `src/lib/data.ts` com fallback pro mock)
- [x] **Etapa 4 — Painel admin** (login restrito, CRUD de produtos com fotos,
  categorias, campanhas, conteúdo do site e configurações)
- [x] **Etapa 5 — Segurança e qualidade** (headers de segurança + CSP, rate
  limiting no login, sitemap/robots, schema.org Product, página 404, campanha
  com landing própria, skip-link de acessibilidade)
- [~] **Etapa 6 — Deploy na Vercel** — código no GitHub
  (`brunocodec0/gabi-bijus`); import na Vercel documentado em
  [DEPLOY.md](DEPLOY.md). Guia da lojista em
  [GUIA-DO-PAINEL.md](GUIA-DO-PAINEL.md).

## Contas admin

Cadastro público é **desabilitado** — só entra no painel (`/admin`) quem tem
usuário criado manualmente **e** está registrado na tabela `admin_users`.

São **duas contas**: a da lojista e a da assistente. Depois de criá-las no
dashboard, rode `supabase/migrations/0004_admins.sql` (trocando os
placeholders pelos e-mails reais) — ele autoriza as duas e remove a conta de
teste.

### Criar uma conta admin (teste ou real)

1. No dashboard do Supabase (conta da loja) → **Authentication → Users →
   Add user → Create new user**. Preencha e-mail e senha e marque
   **Auto Confirm User**.
2. No **SQL Editor**, rode (trocando o e-mail):

   ```sql
   insert into public.admin_users (user_id, email)
   select id, email from auth.users where email = 'admin-teste@gabibijus.com';
   ```

3. Pronto — entre em `/admin/login`.

### Trocar o admin de teste pelos e-mails reais

Quando os 2 e-mails definitivos existirem:

1. Crie os 2 usuários (passos 1–2 acima, um para cada e-mail).
2. Remova o de teste:

   ```sql
   delete from public.admin_users where email = 'admin-teste@gabibijus.com';
   ```

   e apague o usuário em **Authentication → Users** (menu ⋯ → Delete user).

## Estrutura

```
src/
  app/            rotas (App Router)
  components/     componentes de UI (a partir da Etapa 1)
  lib/
    supabase/     clientes browser (client.ts) e servidor (server.ts)
```
