import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartProvider } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import {
  getFreteDisponivel,
  getProducts,
  getSiteContent,
  getTema,
} from "@/lib/data";
import { cssDoTema } from "@/lib/tema";

/**
 * Layout das páginas públicas (vitrine).
 * Busca produtos e conteúdo no servidor e injeta no carrinho/rodapé.
 * O /admin tem layout próprio, fora deste grupo.
 */

// As páginas são cacheadas e revalidadas a cada 5 min; qualquer
// alteração no painel revalida na hora (revalidarSitePublico).
export const revalidate = 300;
export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [products, content, freteDisponivel, tema] = await Promise.all([
    getProducts(),
    getSiteContent(),
    getFreteDisponivel(),
    getTema(),
  ]);

  return (
    <CartProvider
      products={products}
      whatsappNumber={content.whatsappNumber}
      orderNote={content.footerNote}
      freteDisponivel={freteDisponivel}
    >
      {/* Cores escolhidas no painel (Configurações → Cores do site).
          Reescreve os tokens do @theme só nas páginas públicas — o
          /admin fica fora deste layout e mantém o visual original,
          então uma cor ruim aqui nunca deixa o painel inutilizável.
          Os valores são validados como #rrggbb em src/lib/tema.ts. */}
      <style dangerouslySetInnerHTML={{ __html: cssDoTema(tema) }} />

      {/* Acessibilidade: pular direto pro conteúdo via teclado */}
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:text-bg-light"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <Footer content={content} />
      <CartDrawer />
    </CartProvider>
  );
}
