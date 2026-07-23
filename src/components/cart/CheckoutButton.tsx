"use client";

import { useCart } from "./CartContext";
import { effectivePrice } from "@/lib/types";
import { orderMessage, waLink } from "@/lib/whatsapp";

/**
 * "Finalizar pedido pelo WhatsApp" — monta a mensagem com os itens
 * disponíveis, o cupom aplicado e o frete escolhido (quando houver)
 * e abre o wa.me. O carrinho NÃO é limpo (a cliente pode voltar
 * pra ajustar o pedido durante a conversa).
 */
export function CheckoutButton({ className = "" }: { className?: string }) {
  const { items, whatsappNumber, cupom, desconto, frete } = useCart();
  const available = items.filter((i) => i.available);

  const handleCheckout = () => {
    const origin = window.location.origin;
    const message = orderMessage(
      available.map((i) => ({
        name: i.product.name,
        qty: i.qty,
        unitPrice: effectivePrice(i.product),
        url: `${origin}/produtos/${i.product.slug}`,
      })),
      {
        frete,
        cupom: cupom && desconto > 0 ? { code: cupom.code, desconto } : null,
      },
    );
    window.open(waLink(message, whatsappNumber), "_blank");
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={available.length === 0}
      className={`w-full rounded-full bg-primary px-7 py-4 font-semibold text-bg-light transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      Finalizar pedido pelo WhatsApp
    </button>
  );
}
