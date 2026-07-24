"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import { CartItemRow } from "./CartItemRow";
import { CheckoutButton } from "./CheckoutButton";
import { CupomInput } from "./CupomInput";
import { FreteCalculator } from "./FreteCalculator";
import { ResumoValores } from "./ResumoValores";

export function CartPageContent() {
  const { items, clear, orderNote, freteDisponivel } = useCart();
  const hasUnavailable = items.some((i) => !i.available);

  return (
    <div className="bg-bg-light">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-16">
        <p className="label-caps text-earth">Seu pedido</p>
        <h1 className="mt-2 text-4xl font-medium md:text-5xl">
          A <em className="squiggle">sacolinha</em>
        </h1>

        {items.length === 0 ? (
          <div className="py-20 text-center">
            <span aria-hidden className="text-5xl">
              ☀
            </span>
            <p className="mt-4 font-display text-2xl italic text-text/60">
              ainda vazia — que tal um dourado novo?
            </p>
            <Link
              href="/produtos"
              className="mt-6 inline-block rounded-full bg-primary px-7 py-3.5 font-semibold text-bg-light transition-colors hover:bg-primary-dark"
            >
              Ver as peças
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 divide-y divide-text/8 rounded-3xl bg-bg px-5 py-2 md:px-7">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            {hasUnavailable && (
              <p className="mt-4 rounded-2xl bg-sun/25 px-4 py-3 text-sm text-text/80">
                Alguns itens esgotaram e ficam de fora do pedido — remova-os ou
                aguarde a próxima leva.
              </p>
            )}

            <CupomInput />
            {freteDisponivel && <FreteCalculator />}

            <div className="mt-6">
              <ResumoValores grande />
            </div>

            <CheckoutButton className="mt-5" />

            <div className="mt-4 flex items-center justify-between">
              <Link
                href="/produtos"
                className="link-underline text-sm font-medium text-primary"
              >
                ← Continuar comprando
              </Link>
              <button
                type="button"
                onClick={clear}
                className="text-sm text-text/50 transition-colors hover:text-text"
              >
                Esvaziar carrinho
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-text/50">{orderNote}</p>
          </>
        )}
      </div>
    </div>
  );
}
