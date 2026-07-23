import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/site/ProductCard";
import { WaveDivider } from "@/components/site/WaveDivider";
import { getCampaignBySlug } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const campanha = await getCampaignBySlug(slug);
  if (!campanha) return {};
  return { title: campanha.title, description: campanha.text };
}

export default async function CampanhaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campanha = await getCampaignBySlug(slug);
  if (!campanha) notFound();

  return (
    <>
      {/* Hero da campanha — clima carioca vibrante */}
      <section className="bg-primary">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:gap-12 md:px-6 md:py-20">
          <div>
            <p className="label-caps text-sun">Campanha</p>
            <h1 className="mt-3 font-display text-4xl font-medium italic leading-[1.08] text-bg-light md:text-5xl">
              {campanha.title}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-bg-light/85 md:text-lg">
              {campanha.text}
            </p>
          </div>
          <div className="relative aspect-[4/5] max-h-105 overflow-hidden rounded-3xl">
            <Image
              src={campanha.image}
              alt={`Campanha ${campanha.title}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </div>
        <WaveDivider id="campanha-wave" className="text-sun/40" height={36} />
      </section>

      {/* Peças da campanha */}
      <section className="bg-bg-light">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <h2 className="text-3xl font-medium">
            As peças <em className="squiggle">desta edição</em>
          </h2>

          {campanha.products.length === 0 ? (
            <p className="mt-8 font-display text-xl italic text-text/50">
              as peças chegam em breve ☀
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
              {campanha.products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}

          <div className="mt-12">
            <Link
              href="/produtos"
              className="link-underline font-display italic text-primary"
            >
              ver o catálogo completo →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
