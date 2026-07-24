import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/ProductGallery";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductCard } from "@/components/site/ProductCard";
import { getProductBySlug, getProducts, relatedProducts } from "@/lib/data";
import { formatBRL } from "@/lib/format";
import { SITE_URL } from "@/lib/site-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images[0].src.startsWith("http")
        ? [product.images[0].src]
        : undefined,
    },
  };
}

const badgeStyles: Record<string, { label: string; classes: string }> = {
  novo: { label: "novo", classes: "bg-primary text-bg-light" },
  ultimas: { label: "últimas unidades", classes: "bg-sun text-on-sun" },
  esgotado: { label: "esgotado", classes: "bg-text/60 text-bg-light" },
};

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const badge = product.badge ? badgeStyles[product.badge] : null;
  const all = await getProducts();
  const related = relatedProducts(all, product);

  // Schema.org Product — ajuda o Google a mostrar preço e disponibilidade
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) =>
      i.src.startsWith("http") ? i.src : `${SITE_URL}${i.src}`,
    ),
    brand: { "@type": "Brand", name: "Gabi Bijus" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/produtos/${product.slug}`,
      priceCurrency: "BRL",
      price: (product.promoPrice ?? product.price).toFixed(2),
      availability:
        product.badge === "esgotado"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
  };

  return (
    <div className="bg-bg-light">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-14">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <ProductGallery images={product.images} />

          <div>
            <p className="label-caps text-earth">{product.category}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-medium md:text-4xl">
                {product.name}
              </h1>
              {badge && (
                <span
                  className={`rounded-full px-3 py-1 font-display text-sm italic ${badge.classes}`}
                >
                  {badge.label}
                </span>
              )}
            </div>

            <p className="mt-4 font-display text-3xl italic text-earth">
              {product.promoPrice ? (
                <>
                  <span className="mr-2 text-xl text-text/40 line-through">
                    {formatBRL(product.price)}
                  </span>
                  {formatBRL(product.promoPrice)}
                </>
              ) : (
                formatBRL(product.price)
              )}
            </p>

            <p className="mt-6 leading-relaxed text-text/80">
              {product.description}
            </p>

            <BuyBox product={product} />

            <dl className="mt-10 space-y-5 border-t border-gold/40 pt-6">
              <div>
                <dt className="label-caps text-earth">Materiais e cuidados</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-text/70">
                  {product.materials}
                </dd>
              </div>
              <div>
                <dt className="label-caps text-earth">Tamanho e ajuste</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-text/70">
                  {product.sizeInfo}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16 md:mt-24">
            <h2 className="text-2xl font-medium md:text-3xl">
              Combina <em className="squiggle">junto</em>
            </h2>
            <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
