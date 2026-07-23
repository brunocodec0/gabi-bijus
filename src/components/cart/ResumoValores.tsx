"use client";

import { useCart } from "./CartContext";
import { formatBRL } from "@/lib/format";

/**
 * Linhas de subtotal, cupom, frete e total — compartilhadas
 * pelo drawer e pela página do carrinho.
 */
export function ResumoValores({ grande = false }: { grande?: boolean }) {
  const { subtotal, desconto, frete, total, cupom } = useCart();
  const detalhado = desconto > 0 || frete !== null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <p className="label-caps text-text/60">Subtotal</p>
        <p
          className={`font-display italic text-earth ${
            detalhado ? "text-lg" : grande ? "text-3xl" : "text-2xl"
          }`}
        >
          {formatBRL(subtotal)}
        </p>
      </div>

      {desconto > 0 && cupom && (
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm text-text/60">Cupom {cupom.code}</p>
          <p className="shrink-0 font-display text-lg italic text-primary">
            −{formatBRL(desconto)}
          </p>
        </div>
      )}

      {frete && (
        <div className="flex items-baseline justify-between gap-4">
          <p className="min-w-0 text-sm text-text/60">
            Frete · <span className="break-words">{frete.label}</span>
          </p>
          <p className="shrink-0 font-display text-lg italic text-earth">
            {formatBRL(frete.price)}
          </p>
        </div>
      )}

      {detalhado && (
        <div className="flex items-baseline justify-between border-t border-gold/40 pt-2">
          <p className="label-caps text-text/60">Total</p>
          <p
            className={`font-display italic text-earth ${grande ? "text-3xl" : "text-2xl"}`}
          >
            {formatBRL(total)}
          </p>
        </div>
      )}
    </div>
  );
}
