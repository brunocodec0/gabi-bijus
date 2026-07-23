import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart/CartPageContent";

export const metadata: Metadata = {
  title: "Carrinho",
};

export default function CarrinhoPage() {
  return <CartPageContent />;
}
