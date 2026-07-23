"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import { effectivePrice, type Product } from "@/lib/types";
import { orderMessage, waLink } from "@/lib/whatsapp";

/** Quantidade + "Adicionar ao carrinho" + "Comprar agora pelo WhatsApp". */
export function BuyBox({ product }: { product: Product }) {
  const { addItem, whatsappNumber, orderNote } = useCart();
  const [qty, setQty] = useState(1);
  const soldOut = product.badge === "esgotado";

  const buyNow = () => {
    const message = orderMessage([
      {
        name: product.name,
        qty,
        unitPrice: effectivePrice(product),
        url: `${window.location.origin}/produtos/${product.slug}`,
      },
    ]);
    window.open(waLink(message, whatsappNumber), "_blank");
  };

  if (soldOut) {
    return (
      <div className="mt-8">
        <button
          type="button"
          disabled
          className="w-full cursor-not-allowed rounded-full bg-text/15 px-7 py-4 font-semibold text-text/40"
        >
          Esgotado
        </button>
        <p className="mt-3 text-center font-display italic text-earth">
          essa voou 🕊 — volta na próxima leva
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-text/20">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Diminuir quantidade"
            className="px-4 py-3 text-text/60 transition-colors hover:text-text"
          >
            −
          </button>
          <span
            aria-live="polite"
            className="min-w-8 text-center font-semibold"
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            aria-label="Aumentar quantidade"
            className="px-4 py-3 text-text/60 transition-colors hover:text-text"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => addItem(product.slug, qty)}
          className="flex-1 rounded-full bg-primary px-7 py-4 font-semibold text-bg-light transition-colors hover:bg-primary-dark"
        >
          Adicionar ao carrinho
        </button>
      </div>

      <button
        type="button"
        onClick={buyNow}
        className="mt-3 w-full rounded-full border-2 border-primary px-7 py-3.5 font-semibold text-primary transition-colors hover:bg-primary hover:text-bg-light"
      >
        Comprar agora pelo WhatsApp
      </button>

      <p className="mt-3 text-center text-xs text-text/50">{orderNote}</p>
    </div>
  );
}
