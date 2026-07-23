import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { logoutAction } from "../login/actions";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s · Painel Gabi Bijus" },
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/admin", label: "Início", exact: true },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/campanhas", label: "Campanhas" },
  { href: "/admin/cupons", label: "Cupons" },
  { href: "/admin/conteudo", label: "Conteúdo do site" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { adminEmail } = await requireAdmin();

  return (
    <div className="flex min-h-svh flex-col bg-bg-light md:flex-row">
      <aside className="shrink-0 border-b border-text/10 bg-bg md:min-h-svh md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-4 md:block md:py-6">
          <Link href="/admin" className="font-display text-xl font-semibold text-primary">
            Gabi <em>Bijus</em>
          </Link>
          <p className="label-caps text-earth md:mt-1">Painel</p>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-text/75 transition-colors hover:bg-primary/10 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden border-t border-text/10 px-5 py-4 md:block">
          <p className="truncate text-xs text-text/50">{adminEmail}</p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="link-underline mt-1.5 text-sm font-medium text-primary"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
