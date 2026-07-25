# Gabi Bijus

E-commerce completo para marca de bijuterias artesanais carioca, em produção, custo mensal zero.

**[→ Ver o site](https://gabi-bijus.vercel.app)**

---

## O que é

Vitrine pública com painel administrativo em português, pensado para quem não é técnica. A lojista entra no painel, cadastra peças com fotos, cria cupons de desconto, e o pedido chega no WhatsApp dela já formatado — sem integração de pagamento, sem mensalidade de plataforma.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Estilo | Tailwind CSS v4 (tokens centralizados em `@theme`) |
| Banco | Supabase — Postgres + Auth + Storage |
| Deploy | Vercel (hobby, gratuito) |

## Funcionalidades

**Site público**
- Hero em tela cheia com carrossel Ken Burns, marquee animado, seção de campanha
- Catálogo com filtros por categoria, abas "Novidades" e "Descontos" automáticas
- Carrinho lateral com cupom de desconto e calculadora de frete (Melhor Envio)
- Pedido finalizado via `wa.me` com itens, cupom e frete já no texto

**Painel admin** (`/admin`)
- Produtos: upload e reordenação de fotos, variações (cor, tamanho), controle de estoque
- Cupons: % ou R$ fixo, pedido mínimo, validade, pausar/ativar
- Campanhas com landing page automática
- Todo o conteúdo do site editável — textos, fotos, WhatsApp, cores

## Decisões técnicas que valem a leitura

**Dois clientes Supabase.** O site público usa um cliente sem cookies para que as páginas sejam cacheadas (ISR, 5 min). O painel usa o cliente com sessão. Misturar os dois fazia o build silenciosamente cair nos dados de mock — um bug que levou um tempo para rastrear.

**RLS em todas as tabelas.** Leitura pública só do que é público; qualquer escrita exige ser admin. A lista de cupons nunca é exposta: a API de validação chama uma `security definer function` que responde sim ou não para um código por vez, com rate limiting.

**Revalidação sob demanda.** Cada server action do painel chama `revalidatePath("/", "layout")` depois de salvar, então a loja reflete a mudança em segundos sem precisar de build.

**Imagens encolhidas no browser.** Foto de câmera tem ~5 MB e a loja não precisa de mais de 2560px. O `upload.ts` usa `createImageBitmap` + canvas para redimensionar e recomprimir (WebP quando disponível) antes de enviar — o que costuma levar 5 MB para menos de 1 MB sem diferença visível.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com as chaves do Supabase
npm run dev
```

As variáveis necessárias estão documentadas no `.env.example`. Sem banco configurado, o site usa dados de exemplo automaticamente.

## Estrutura

```
src/
  app/
    (site)/       páginas públicas (home, catálogo, produto, carrinho…)
    admin/        painel administrativo
    api/          rotas de API (cupom, frete)
  components/
    cart/         carrinho, drawer, cupom, frete
    home/         hero, seções da home
    product/      galeria, buy box
    site/         header, footer, componentes compartilhados
  lib/
    supabase/     public.ts (sem cookies) e server.ts (com sessão)
    data.ts       camada de leitura pública
    whatsapp.ts   montagem da mensagem de pedido
```
