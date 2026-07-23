# Publicar o site na Vercel

O código está em **https://github.com/brunocodec0/gabi-bijus** (privado).
A Vercel vai ler esse repositório e publicar o site — e, a partir daí, **todo
push atualiza o site sozinho**.

## 1. Importar o projeto

1. Entre em https://vercel.com/new
2. Conecte a conta do GitHub (se ainda não estiver) e autorize o acesso ao
   repositório `gabi-bijus`.
3. Clique em **Import** no `gabi-bijus`.
4. A Vercel detecta o Next.js sozinha — **não mude** Framework, Build Command
   nem Output Directory.

## 2. Colar as variáveis de ambiente

Ainda na tela de import, abra **Environment Variables** e cole o bloco abaixo
(a Vercel aceita colar tudo de uma vez). Os valores estão no seu `.env.local`
— **nunca** compartilhe este arquivo publicamente.

```
NEXT_PUBLIC_SUPABASE_URL=<mesmo valor do .env.local>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<mesmo valor do .env.local>
NEXT_PUBLIC_WHATSAPP_NUMBER=5521999782324
MELHOR_ENVIO_TOKEN=<mesmo valor do .env.local>
NEXT_PUBLIC_SITE_URL=https://gabi-bijus.vercel.app
```

> Se a Vercel der outro endereço ao projeto (ela mostra na tela seguinte),
> ajuste `NEXT_PUBLIC_SITE_URL` em **Settings → Environment Variables** e
> clique em **Redeploy**. Essa variável só afeta SEO/sitemap.

## 3. Deploy

Clique em **Deploy** e espere ~2 minutos. O site sai em
`https://gabi-bijus.vercel.app` (ou o endereço que a Vercel mostrar).

## 4. Depois de publicado — checklist

- [ ] Abrir a home e ver as fotos girando
- [ ] Catálogo, uma peça, adicionar ao carrinho
- [ ] Cupom `VERAO10` e cálculo de frete no carrinho
- [ ] "Finalizar pedido" abre o WhatsApp **+55 21 99978-2324**
- [ ] `/admin/login` entra com as contas novas
- [ ] Criar/editar um produto e ver a mudança no site

## 5. Domínio próprio (opcional)

**Settings → Domains → Add**. A Vercel mostra os registros de DNS para
apontar no seu registrador. Depois, atualize `NEXT_PUBLIC_SITE_URL`.

## Atualizações futuras

```bash
git add -A
git commit -m "o que mudou"
git push
```

A Vercel publica a nova versão em ~1 minuto.
