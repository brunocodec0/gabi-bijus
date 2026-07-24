import { HeroCarousel } from "./HeroCarousel";
import type { Product, SiteContent } from "@/lib/types";

interface HeroBentoProps {
  products: Product[];
  content: SiteContent;
}

export function HeroBento({ products, content }: HeroBentoProps) {
  const disponiveis = products.filter((p) => p.badge !== "esgotado");

  // A lojista escolhe as peças da tela principal no painel
  // (Produtos → "Aparece na tela principal"), na ordem que definir.
  const escolhidas = disponiveis
    .filter((p) => p.inHero)
    .sort((a, b) => a.heroOrder - b.heroOrder);

  // Enquanto ela não escolher nenhuma, mantém o comportamento antigo
  // (destaques primeiro) — assim a home nunca fica sem hero.
  const showcase = (
    escolhidas.length > 0
      ? escolhidas
      : [
          ...disponiveis.filter((p) => p.featured),
          ...disponiveis.filter((p) => !p.featured),
        ]
  ).slice(0, 10);

  return (
    <HeroCarousel
      products={showcase}
      tagline={content.heroTagline}
      highlight={content.heroHighlight}
    />
  );
}
