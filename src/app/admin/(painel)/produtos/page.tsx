import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { formatBRL } from "@/lib/format";

export const metadata: Metadata = { title: "Produtos" };

interface Row {
  id: string;
  name: string;
  slug: string;
  price: number;
  promo_price: number | null;
  is_new: boolean;
  featured: boolean;
  sold_out: boolean;
  active: boolean;
  categories: { name: string } | null;
  product_images: { url: string; sort_order: number }[];
}

export default async function AdminProdutos({
  searchParams,
}: {
  searchParams: Promise<{
    busca?: string;
    salvo?: string;
    excluido?: string;
    migracao?: string;
  }>;
}) {
  const { supabase } = await requireAdmin();
  const { busca, salvo, excluido, migracao } = await searchParams;

  let query = supabase
    .from("products")
    .select(
      "id,name,slug,price,promo_price,is_new,featured,sold_out,active,categories(name),product_images(url,sort_order)",
    )
    .order("created_at", { ascending: false });
  if (busca) query = query.ilike("name", `%${busca}%`);

  const { data } = await query;
  const produtos = (data ?? []) as unknown as Row[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-medium">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="rounded-full bg-primary px-6 py-3 font-semibold text-bg-light transition-colors hover:bg-primary-dark"
        >
          + Nova peça
        </Link>
      </div>

      {salvo && (
        <p className="mt-4 rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary">
          Peça salva! Já está valendo no site. ✨
        </p>
      )}
      {excluido && (
        <p className="mt-4 rounded-2xl bg-sun/30 px-4 py-3 text-sm">
          Peça excluída.
        </p>
      )}
      {migracao === "pendente" && (
        <p className="mt-4 rounded-2xl bg-sun/30 px-4 py-3 text-sm">
          <strong>As variações não foram salvas.</strong> O banco ainda precisa
          receber a atualização que criou esse recurso — o resto da peça foi
          salvo normalmente. Avise quem cuida do site.
        </p>
      )}

      <form className="mt-6" action="/admin/produtos" method="get">
        <input
          type="search"
          name="busca"
          defaultValue={busca ?? ""}
          placeholder="Buscar pelo nome…"
          className="w-full max-w-sm rounded-full border border-text/15 bg-white px-5 py-2.5 outline-none transition-colors focus:border-primary"
        />
      </form>

      {produtos.length === 0 ? (
        <p className="mt-10 font-display text-xl italic text-text/50">
          {busca
            ? "nenhuma peça com esse nome ☀"
            : "nenhuma peça ainda — cadastre a primeira!"}
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {produtos.map((p) => {
            const capa = [...p.product_images].sort(
              (a, b) => a.sort_order - b.sort_order,
            )[0];
            return (
              <li key={p.id}>
                <Link
                  href={`/admin/produtos/${p.id}`}
                  className="flex items-center gap-4 rounded-3xl border border-text/10 bg-white p-3 transition-colors hover:border-primary"
                >
                  <span className="relative block h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-bg">
                    {capa && (
                      <Image
                        src={capa.url}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display font-medium">
                      {p.name}
                    </span>
                    <span className="block text-sm text-text/50">
                      {p.categories?.name ?? "Sem categoria"} ·{" "}
                      {p.promo_price
                        ? `${formatBRL(Number(p.promo_price))} (promo)`
                        : formatBRL(Number(p.price))}
                    </span>
                  </span>

                  <span className="flex shrink-0 flex-wrap justify-end gap-1.5">
                    {!p.active && (
                      <span className="rounded-full bg-text/10 px-2.5 py-1 text-xs font-semibold text-text/60">
                        inativa
                      </span>
                    )}
                    {p.sold_out && (
                      <span className="rounded-full bg-text/60 px-2.5 py-1 text-xs font-semibold text-bg-light">
                        esgotada
                      </span>
                    )}
                    {p.featured && (
                      <span className="rounded-full bg-gold px-2.5 py-1 text-xs font-semibold">
                        destaque
                      </span>
                    )}
                    {p.is_new && (
                      <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-bg-light">
                        nova
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
