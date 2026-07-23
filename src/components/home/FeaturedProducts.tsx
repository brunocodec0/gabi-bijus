import Link from "next/link";
import { ProductCard } from "@/components/site/ProductCard";
import type { Product } from "@/lib/types";

export function FeaturedProducts({ products }: { products: Product[] }) {
  const featured = products.filter((p) => p.featured).slice(0, 4);

  return (
    <section className="bg-bg-light">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="label-caps text-earth">Coleção em destaque</p>
            <h2 className="mt-2 text-3xl font-medium md:text-4xl">
              Os <em className="squiggle">favs</em> do momento
            </h2>
          </div>
          <Link
            href="/produtos"
            className="link-underline hidden shrink-0 font-display italic text-primary md:inline"
          >
            ver tudo →
          </Link>
        </div>

        {/* Grid com respiro editorial: colunas pares descem um pouco no desktop */}
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {featured.map((product, i) => (
            <div key={product.id} className={i % 2 === 1 ? "md:mt-12" : ""}>
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link
            href="/produtos"
            className="inline-block rounded-full border-2 border-primary px-7 py-3 font-semibold text-primary transition-colors hover:bg-primary hover:text-bg-light"
          >
            Ver tudo
          </Link>
        </div>
      </div>
    </section>
  );
}
