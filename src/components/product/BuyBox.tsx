"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import {
  describeSelection,
  effectivePrice,
  type OptionSelection,
  type Product,
} from "@/lib/types";
import { orderMessage, waLink } from "@/lib/whatsapp";

/** Quantidade + "Adicionar ao carrinho" + "Comprar agora pelo WhatsApp". */
export function BuyBox({ product }: { product: Product }) {
  const { addItem, whatsappNumber, orderNote } = useCart();
  const [qty, setQty] = useState(1);
  // Nada vem pré-escolhido: a cliente tem que decidir a cor de
  // propósito, senão o pedido chega com uma opção que ela não quis.
  const [selection, setSelection] = useState<OptionSelection>({});
  const [aviso, setAviso] = useState<string | null>(null);
  const soldOut = product.badge === "esgotado";

  const faltando = product.options.filter((o) => !selection[o.name]);

  /** Garante que tudo foi escolhido antes de seguir. */
  const escolhasOk = () => {
    if (faltando.length === 0) return true;
    setAviso(
      faltando.length === 1
        ? `Escolha ${faltando[0].name.toLowerCase()} antes de continuar.`
        : "Escolha as opções da peça antes de continuar.",
    );
    return false;
  };

  const escolher = (grupo: string, valor: string) => {
    setSelection((s) => ({ ...s, [grupo]: valor }));
    setAviso(null);
  };

  const buyNow = () => {
    if (!escolhasOk()) return;
    const escolhas = describeSelection(selection);
    const message = orderMessage([
      {
        name: escolhas ? `${product.name} (${escolhas})` : product.name,
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
      {/* Escolhas da peça: material, cor da cordinha… */}
      {product.options.map((opcao) => (
        <fieldset key={opcao.id} className="mb-5">
          <legend className="label-caps text-earth">
            {opcao.name}
            {selection[opcao.name] && (
              <span className="ml-2 font-normal normal-case tracking-normal text-text/60">
                {selection[opcao.name]}
              </span>
            )}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {opcao.values.map((valor) => {
              const ativa = selection[opcao.name] === valor.label;
              return (
                <button
                  key={valor.id}
                  type="button"
                  aria-pressed={ativa}
                  onClick={() => escolher(opcao.name, valor.label)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    ativa
                      ? "bg-primary text-bg-light"
                      : "border border-text/20 text-text/70 hover:border-primary hover:text-primary"
                  }`}
                >
                  {valor.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {aviso && (
        <p role="alert" className="mb-4 rounded-2xl bg-sun/30 px-4 py-3 text-sm">
          {aviso}
        </p>
      )}

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
          onClick={() => {
            if (escolhasOk()) addItem(product.slug, qty, selection);
          }}
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
