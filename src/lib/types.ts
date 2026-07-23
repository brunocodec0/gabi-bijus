export type ProductBadge = "novo" | "ultimas" | "esgotado";

export interface ProductImage {
  src: string;
  alt: string;
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
  description: string;
  materials: string;
  sizeInfo: string;
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
