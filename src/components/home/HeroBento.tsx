import { HeroCarousel } from "./HeroCarousel";
import type { Product, SiteContent } from "@/lib/types";

interface HeroBentoProps {
  products: Product[];
  content: SiteContent;
}

export function HeroBento({ products, content }: HeroBentoProps) {
  // Vitrine em tela cheia: destaques primeiro, depois o resto do
  // catálogo ativo (esgotados ficam de fora). Até 10 fotos.
  const showcase = [
    ...products.filter((p) => p.featured && p.badge !== "esgotado"),
    ...products.filter((p) => !p.featured && p.badge !== "esgotado"),
  ].slice(0, 10);

  return (
    <HeroCarousel
      products={showcase}
      tagline={content.heroTagline}
      highlight={content.heroHighlight}
    />
  );
}
