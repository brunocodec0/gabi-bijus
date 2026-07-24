export type ProductBadge = "novo" | "ultimas" | "esgotado";

export interface ProductImage {
  src: string;
  alt: string;
  /**
   * Ponto da foto que deve ficar visível quando ela é cortada para
   * preencher um quadro (o hero em tela cheia, principalmente).
   * Em % — 50/50 é o centro. Vira `object-position` no CSS.
   */
  focalX: number;
  focalY: number;
}

/** Uma escolha possível dentro de um grupo: "Dourado", "Prata"… */
export interface ProductOptionValue {
  id: string;
  label: string;
}

/**
 * Grupo de escolha da peça: "Material", "Cor da cordinha"…
 * A cliente escolhe um valor de cada grupo antes de pôr no carrinho.
 * Preço e estoque continuam sendo do produto, não da combinação.
 */
export interface ProductOption {
  id: string;
  name: string;
  values: ProductOptionValue[];
}

export interface Category {
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  promoPrice?: number;
  images: ProductImage[];
  badge?: ProductBadge;
  featured: boolean;
  /** aparece no carrossel da tela principal (escolhido no painel) */
  inHero: boolean;
  heroOrder: number;
  description: string;
  materials: string;
  sizeInfo: string;
  /** vazio quando a peça não tem variações */
  options: ProductOption[];
}

/**
 * Escolhas da cliente: nome do grupo → valor.
 * Ex.: { "Material": "Prata", "Cor da cordinha": "Marrom" }
 */
export type OptionSelection = Record<string, string>;

/**
 * Identidade de uma linha do carrinho. Duas unidades da mesma peça
 * em cores diferentes são linhas separadas, então a chave precisa
 * incluir as escolhas.
 */
export function cartLineId(
  slug: string,
  selection: OptionSelection = {},
): string {
  const partes = Object.keys(selection)
    .sort()
    .map((k) => `${k}=${selection[k]}`);
  return partes.length ? `${slug}|${partes.join("|")}` : slug;
}

/** "Prata · Marrom" — para mostrar na listagem e no pedido. */
export function describeSelection(selection: OptionSelection = {}): string {
  return Object.values(selection).join(" · ");
}

export interface Campaign {
  title: string;
  slug: string;
  text: string;
  image: string;
  ctaLabel: string;
}

export interface SiteContent {
  heroTagline: string;
  heroHighlight: string; // palavra destacada em itálico dentro da tagline
  heroSubtitle: string;
  marqueeWords: string[];
  aboutTitle: string;
  aboutText: string;
  instagramHandle: string;
  instagramUrl: string;
  instagramImages: { src: string; alt: string }[];
  whatsappNumber: string | null; // null até o número ser definido
  footerNote: string;
  careNote: string;
  politicaTrocas: string;
}

/** Preço efetivo (promocional quando existir). */
export function effectivePrice(p: Product): number {
  return p.promoPrice ?? p.price;
}
