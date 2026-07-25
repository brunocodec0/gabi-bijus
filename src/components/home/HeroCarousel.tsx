"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Stamp } from "@/components/site/Stamp";
import { effectivePrice, type Product } from "@/lib/types";
import { formatBRL } from "@/lib/format";

const INTERVAL_MS = 5000;

/**
 * Hero em tela cheia — as fotos dos produtos passam em full-bleed
 * com zoom lento (efeito Ken Burns) e o título fica sobre a imagem.
 * A lojista controla as fotos pelo admin (produtos ativos, Etapa 4).
 */
interface HeroCarouselProps {
  products: Product[];
  tagline: string;
  highlight: string;
}

export function HeroCarousel({ products, tagline, highlight }: HeroCarouselProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (products.length <= 1) return;
    const id = setInterval(
      () => setActive((a) => (a + 1) % products.length),
      INTERVAL_MS,
    );
    return () => clearInterval(id);
  }, [products.length]);

  if (products.length === 0) return null;
  const current = products[active];

  return (
    <section className="relative h-[calc(100svh-3.9rem)] max-h-225 min-h-140 overflow-hidden bg-earth">
      {/* Fotos em tela cheia com zoom lento */}
      {products.map((p, i) => (
        <Image
          key={p.id}
          src={p.images[0].src}
          alt={p.images[0].alt}
          fill
          priority={i === 0}
          quality={90}
          sizes="100vw"
          style={{
            transition: `opacity 0.9s ease, scale ${INTERVAL_MS + 2000}ms linear`,
            // Enquadramento escolhido no painel. Sem isso o corte é
            // sempre no centro e, em foto vertical de modelo, a peça
            // (que fica no colo/pescoço) sai do quadro.
            objectPosition: `${p.images[0].focalX}% ${p.images[0].focalY}%`,
          }}
          className={`object-cover ${
            i === active ? "scale-[1.08] opacity-100" : "scale-100 opacity-0"
          }`}
        />
      ))}

      {/* Véu para leitura do texto */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-text/75 via-text/20 to-text/10"
      />

      {/* Carimbo giratório */}
      <Stamp className="absolute right-4 top-5 z-10 h-24 w-24 text-bg md:right-10 md:top-8 md:h-32 md:w-32" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-8 md:px-6 md:pb-12">
        <p className="label-caps text-sun">
          Bijuterias artesanais · Rio de Janeiro
        </p>

        <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.5rem,6vw,4.8rem)] font-medium leading-[1.05] tracking-tight text-bg-light">
          {tagline} <em className="squiggle">{highlight}</em>.
        </h1>

        <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4">
          <Link
            href="/produtos"
            className="rounded-full bg-sun px-8 py-4 font-semibold text-on-sun transition-transform duration-300 hover:scale-[1.03]"
          >
            Ver as peças
          </Link>
          <Link
            href="/sobre"
            className="link-underline font-display text-lg italic text-bg-light"
          >
            quem faz, faz com a mão
          </Link>
        </div>

        {/* Linha de baixo: navegação + etiqueta da peça atual */}
        <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-bg-light/25 pt-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {products.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Ver ${p.name}`}
                  aria-current={i === active}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active
                      ? "w-6 bg-sun"
                      : "w-2 bg-bg-light/40 hover:bg-bg-light/70"
                  }`}
                />
              ))}
            </div>
            <p
              aria-hidden
              className="font-display text-sm italic text-bg-light/70"
            >
              {String(active + 1).padStart(2, "0")} —{" "}
              {String(products.length).padStart(2, "0")}
            </p>
          </div>

          <Link
            href={`/produtos/${current.slug}`}
            className="flex items-baseline gap-3 rounded-full bg-bg/90 py-2.5 pl-5 pr-4 backdrop-blur-sm transition-colors hover:bg-bg"
          >
            <span className="font-display font-medium">{current.name}</span>
            <span className="font-display text-sm italic text-earth">
              {formatBRL(effectivePrice(current))}
            </span>
            <span aria-hidden className="text-primary">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
