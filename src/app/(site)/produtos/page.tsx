import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/site/ProductCard";
import { SortSelect } from "@/components/catalog/SortSelect";
import { getActiveCampaigns, getCategories, getProducts } from "@/lib/data";
import { effectivePrice, type Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "Produtos",
  description:
    "Catálogo de bijuterias artesanais da Gabi Bijus: colares, chokers, brincos, pulseiras, body chains e anéis feitos à mão no Rio de Janeiro.",
};

function sortProducts(list: Product[], ordem?: string): Product[] {
  const sorted = [...list];
  switch (ordem) {
    case "preco-asc":
      return sorted.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    case "preco-desc":
      return sorted.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    default:
      // novidades: badge "novo" primeiro (a lista já vem do mais recente
      // para o mais antigo)
      return sorted.sort((a, b) => {
        const novoA = a.badge === "novo" ? 1 : 0;
        const novoB = b.badge === "novo" ? 1 : 0;
        return novoB - novoA;
      });
  }
}

// Filtros especiais controlados pelo painel: "novidades" mostra as peças
// com badge "novo"; "descontos", as com preço promocional.
// O ícone é um caractere tipográfico (não emoji colorido): acompanha a
// cor do texto e combina com o resto da marca. Fica em aria-hidden para
// o leitor de tela anunciar só a palavra.
const filtrosEspeciais = [
  { slug: "novidades", icone: "✦", label: "Novidades", titulo: "Novidades" },
  { slug: "descontos", icone: "☀", label: "Descontos", titulo: "Descontos" },
] as const;

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{
    categoria?: string;
    ordem?: string;
    filtro?: string;
    colecao?: string;
  }>;
}) {
  const [{ categoria, ordem, filtro, colecao }, products, categories, campanhas] =
    await Promise.all([searchParams, getProducts(), getCategories(), getActiveCampaigns()]);

  const activeCategory = categories.find((c) => c.slug === categoria);
  const activeFiltro = filtrosEspeciais.find((f) => f.slug === filtro);
  const activeColecao = campanhas.find((c) => c.slug === colecao);

  let filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory.name)
    : products;
  if (activeColecao) {
    const ids = new Set(activeColecao.productIds);
    filtered = filtered.filter((p) => ids.has(p.id));
  } else if (activeFiltro?.slug === "novidades") {
    filtered = filtered.filter((p) => p.badge === "novo");
  } else if (activeFiltro?.slug === "descontos") {
    filtered = filtered.filter((p) => p.promoPrice !== undefined);
  }
  const list = sortProducts(filtered, ordem);

  const filterHref = (opts: { categoria?: string; filtro?: string; colecao?: string }) => {
    const params = new URLSearchParams();
    if (opts.categoria) params.set("categoria", opts.categoria);
    if (opts.filtro) params.set("filtro", opts.filtro);
    if (opts.colecao) params.set("colecao", opts.colecao);
    if (ordem) params.set("ordem", ordem);
    return `/produtos${params.size ? `?${params}` : ""}`;
  };

  return (
    <div className="bg-bg-light">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
        <p className="label-caps text-earth">Catálogo</p>
        <h1 className="mt-2 text-4xl font-medium md:text-5xl">
          {activeColecao ? (
            <>
              <em className="squiggle">{activeColecao.title}</em>
            </>
          ) : activeFiltro ? (
            <>
              {activeFiltro.titulo === "Novidades" ? "As " : "Os "}
              <em className="squiggle">
                {activeFiltro.titulo.toLowerCase()}
              </em>
            </>
          ) : (
            <>
              As <em className="squiggle">peças</em>
            </>
          )}
        </h1>

        {/* Filtros especiais + categorias */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <Link
            href={filterHref({ categoria })}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              !activeFiltro && !activeColecao
                ? "bg-primary text-bg-light"
                : "border border-text/15 text-text/70 hover:border-primary hover:text-primary"
            }`}
          >
            Tudo
          </Link>
          {filtrosEspeciais.map((f) => (
            <Link
              key={f.slug}
              href={filterHref({ categoria, filtro: f.slug })}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeFiltro?.slug === f.slug
                  ? "bg-sun text-on-sun"
                  : "border border-gold/60 text-text/70 hover:border-gold hover:bg-sun/20"
              }`}
            >
              <span aria-hidden className="mr-1.5">
                {f.icone}
              </span>
              {f.label}
            </Link>
          ))}
          {campanhas.length > 0 && (
            <>
              <span aria-hidden className="mx-1 h-5 w-px bg-text/15" />
              {campanhas.map((c) => (
                <Link
                  key={c.slug}
                  href={filterHref({
                    colecao: activeColecao?.slug === c.slug ? undefined : c.slug,
                  })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    activeColecao?.slug === c.slug
                      ? "bg-primary text-bg-light"
                      : "border border-text/15 text-text/70 hover:border-primary hover:text-primary"
                  }`}
                >
                  {c.title}
                </Link>
              ))}
            </>
          )}
          <span aria-hidden className="mx-1 h-5 w-px bg-text/15" />
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={filterHref({
                categoria: activeCategory?.slug === c.slug ? undefined : c.slug,
                filtro,
                colecao,
              })}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeCategory?.slug === c.slug
                  ? "bg-primary text-bg-light"
                  : "border border-text/15 text-text/70 hover:border-primary hover:text-primary"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="font-display italic text-text/50">
            {list.length} {list.length === 1 ? "peça" : "peças"}
          </p>
          <SortSelect />
        </div>

        {list.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-2xl italic text-text/60">
              nada por aqui ainda — novas peças a caminho ☀
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {list.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
