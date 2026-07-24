import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatBRL } from "@/lib/format";

const badgeStyles: Record<string, { label: string; classes: string }> = {
  novo: { label: "novo", classes: "bg-primary text-bg-light" },
  ultimas: { label: "últimas unidades", classes: "bg-sun text-on-sun" },
  esgotado: { label: "esgotado", classes: "bg-text/60 text-bg-light" },
};

interface ProductCardProps {
  product: Product;
  /** posição no grid — vira o "Nº 01" editorial */
  index?: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const badge = product.badge ? badgeStyles[product.badge] : null;
  const soldOut = product.badge === "esgotado";

  return (
    <Link href={`/produtos/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-bg">
        <Image
          src={product.images[0].src}
          alt={product.images[0].alt}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${
            soldOut ? "opacity-60 saturate-50" : ""
          }`}
        />
        {badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 font-display text-sm italic ${badge.classes}`}
          >
            {badge.label}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <div>
          {typeof index === "number" && (
            <p className="label-caps text-text/40">
              Nº {String(index + 1).padStart(2, "0")}
            </p>
          )}
          <h3 className="mt-0.5 font-display text-lg leading-snug">
            {product.name}
          </h3>
        </div>
        <p className="shrink-0 font-display text-lg italic text-earth">
          {product.promoPrice ? (
            <>
              <span className="mr-1.5 text-sm text-text/40 line-through">
                {formatBRL(product.price)}
              </span>
              {formatBRL(product.promoPrice)}
            </>
          ) : (
            formatBRL(product.price)
          )}
        </p>
      </div>

      <p className="mt-1 text-sm text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        ver peça →
      </p>
    </Link>
  );
}
