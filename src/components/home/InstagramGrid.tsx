import Image from "next/image";
import type { SiteContent } from "@/lib/types";

// Rotações alternadas — fotos espalhadas na mesa, como polaroids
const tilts = [
  "-rotate-2",
  "rotate-[1.5deg]",
  "rotate-2",
  "-rotate-1",
  "rotate-1",
  "-rotate-2",
];

export function InstagramGrid({ content }: { content: SiteContent }) {
  return (
    <section className="overflow-hidden bg-bg-light">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label-caps text-earth">No feed</p>
            <h2 className="mt-2 text-3xl font-medium md:text-4xl">
              Vem ver de <em className="squiggle">perto</em>
            </h2>
          </div>
          <a
            href={content.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline font-display italic text-primary"
          >
            {content.instagramHandle} →
          </a>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-5">
          {content.instagramImages.map((img, i) => (
            <a
              key={img.src}
              href={content.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`block bg-white p-1.5 pb-5 shadow-[0_2px_10px_rgba(43,29,20,0.09)] transition-transform duration-300 ease-out hover:rotate-0 hover:scale-[1.04] md:p-2 md:pb-7 ${tilts[i % tilts.length]}`}
            >
              <span className="relative block aspect-square overflow-hidden">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 33vw, 16vw"
                  className="object-cover"
                />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
