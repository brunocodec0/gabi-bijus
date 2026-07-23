import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";

const atalhos = [
  {
    href: "/admin/produtos",
    titulo: "Produtos",
    texto: "Cadastre peças, troque fotos, marque destaques e esgotados.",
  },
  {
    href: "/admin/campanhas",
    titulo: "Campanhas",
    texto: "Crie e ative campanhas que aparecem na home.",
  },
  {
    href: "/admin/conteudo",
    titulo: "Conteúdo do site",
    texto: "Edite os textos da home, do sobre, do rodapé e o WhatsApp.",
  },
];

export default async function AdminHome() {
  const { supabase } = await requireAdmin();

  const [{ count: totalProdutos }, { count: totalAtivos }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("active", true)
      .eq("sold_out", false),
  ]);

  return (
    <div>
      <p className="label-caps text-earth">Bem-vinda de volta ☀</p>
      <h1 className="mt-1 text-3xl font-medium">Seu ateliê digital</h1>

      <div className="mt-6 flex flex-wrap gap-4">
        <div className="rounded-3xl bg-bg px-6 py-5">
          <p className="font-display text-3xl font-semibold text-primary">
            {totalProdutos ?? 0}
          </p>
          <p className="text-sm text-text/60">peças cadastradas</p>
        </div>
        <div className="rounded-3xl bg-bg px-6 py-5">
          <p className="font-display text-3xl font-semibold text-primary">
            {totalAtivos ?? 0}
          </p>
          <p className="text-sm text-text/60">à venda agora</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {atalhos.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-3xl border border-text/10 bg-white p-6 transition-colors hover:border-primary"
          >
            <h2 className="font-display text-xl font-medium text-primary">
              {a.titulo} →
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text/70">
              {a.texto}
            </p>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-sm text-text/50">
        O site público está em{" "}
        <Link href="/" target="_blank" className="link-underline text-primary">
          gabibijus (abrir em nova aba)
        </Link>
        . Tudo o que você salvar aqui aparece lá na hora.
      </p>
    </div>
  );
}
