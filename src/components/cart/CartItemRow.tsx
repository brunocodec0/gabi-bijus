"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart, type CartItem } from "./CartContext";
import { effectivePrice } from "@/lib/types";
import { formatBRL } from "@/lib/format";

export function CartItemRow({ item }: { item: CartItem }) {
  const { setQty, removeItem } = useCart();
  const { product, qty, available } = item;

  return (
    <div
      className={`flex gap-3.5 py-4 ${available ? "" : "opacity-60"}`}
      data-testid="cart-item"
    >
      <Link
        href={`/produtos/${product.slug}`}
        className="relative block h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-bg"
      >
        <Image
          src={product.images[0].src}
          alt={product.images[0].alt}
          fill
          sizes="80px"
          className="object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/produtos/${product.slug}`}
            className="font-display leading-snug hover:text-primary"
          >
            {product.name}
          </Link>
          <button
            type="button"
            onClick={() => removeItem(product.slug)}
            aria-label={`Remover ${product.name} do carrinho`}
            className="rounded-full p-1 text-text/40 transition-colors hover:bg-text/5 hover:text-text"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {available ? (
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <div className="flex items-center rounded-full border border-text/15">
              <button
                type="button"
                onClick={() => setQty(product.slug, qty - 1)}
                aria-label="Diminuir quantidade"
                className="px-3 py-1.5 text-text/60 transition-colors hover:text-text"
              >
                −
              </button>
              <span className="min-w-6 text-center text-sm font-semibold">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty(product.slug, qty + 1)}
                aria-label="Aumentar quantidade"
                className="px-3 py-1.5 text-text/60 transition-colors hover:text-text"
              >
                +
              </button>
            </div>
            <p className="font-display italic text-earth">
              {formatBRL(effectivePrice(product) * qty)}
            </p>
          </div>
        ) : (
          <p className="mt-auto pt-2 font-display text-sm italic text-earth">
            esgotou 😢 — remova ou espere a próxima leva
          </p>
        )}
      </div>
    </div>
  );
}
