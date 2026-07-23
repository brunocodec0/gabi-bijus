"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { CartItemRow } from "./CartItemRow";
import { CheckoutButton } from "./CheckoutButton";
import { CupomInput } from "./CupomInput";
import { FreteCalculator } from "./FreteCalculator";
import { ResumoValores } from "./ResumoValores";

export function CartDrawer() {
  const { items, isOpen, closeDrawer, orderNote, freteDisponivel } = useCart();

  // Esc fecha; trava o scroll da página enquanto aberto
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeDrawer]);

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden
        onClick={closeDrawer}
        className={`fixed inset-0 z-40 bg-text/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Painel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-bg-light shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-gold/40 px-5 py-4">
          <h2 className="font-display text-2xl font-medium">
            Sua <em className="text-earth">sacolinha</em>
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Fechar carrinho"
            className="rounded-full p-2 text-text/50 transition-colors hover:bg-text/5 hover:text-text"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span aria-hidden className="text-4xl">
              ☀
            </span>
            <p className="font-display text-xl italic text-text/70">
              ainda vazia — que tal um dourado novo?
            </p>
            <Link
              href="/produtos"
              onClick={closeDrawer}
              className="link-underline font-medium text-primary"
            >
              Ver as peças
            </Link>
          </div>
        ) : (
          <>
            {/* Itens + cupom + frete rolam juntos */}
            <div className="flex-1 overflow-y-auto px-5">
              <div className="divide-y divide-text/8">
                {items.map((item) => (
                  <CartItemRow key={item.product.slug} item={item} />
                ))}
              </div>

              <div className="mt-4 space-y-4 border-t border-text/8 pt-5">
                <CupomInput compacto />
                {freteDisponivel && <FreteCalculator compacto />}
              </div>

              <div className="h-4" />
            </div>

            {/* Resumo e ação, sempre visíveis */}
            <footer className="border-t border-gold/40 bg-bg-light px-5 py-4">
              <ResumoValores />
              <CheckoutButton className="mt-3.5" />
              <Link
                href="/carrinho"
                onClick={closeDrawer}
                className="link-underline mx-auto mt-3 block w-fit text-sm font-medium text-primary"
              >
                Ver carrinho completo
              </Link>
              <p className="mt-2.5 text-center text-xs text-text/50">
                {orderNote}
              </p>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
