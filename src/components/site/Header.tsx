"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";

const nav = [
  { href: "/produtos", label: "Produtos" },
  { href: "/produtos?filtro=novidades", label: "Novidades" },
  { href: "/produtos?filtro=descontos", label: "Descontos" },
  { href: "/sobre", label: "Sobre" },
];

export function Header() {
  const { count, openDrawer } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-text/10 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 md:px-6">
        {/* Logo placeholder tipográfico até o arquivo final */}
        <Link
          href="/"
          className="font-display text-2xl font-semibold tracking-tight text-primary"
        >
          Gabi <em>Bijus</em>
        </Link>

        <nav className="flex items-center gap-3.5 sm:gap-5 md:gap-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="link-underline whitespace-nowrap text-sm font-medium text-text md:text-base"
            >
              {item.label}
            </Link>
          ))}

          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Abrir carrinho (${count} ${count === 1 ? "item" : "itens"})`}
            className="relative rounded-full p-2 text-primary transition-colors hover:bg-primary/10"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6 7h12l1.5 13.5a1 1 0 0 1-1 1.1H5.5a1 1 0 0 1-1-1.1L6 7Z" />
              <path d="M9 10V6a3 3 0 0 1 6 0v4" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-text">
                {count}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
