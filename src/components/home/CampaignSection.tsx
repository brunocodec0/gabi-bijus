import Link from "next/link";
import type { Campaign } from "@/lib/types";

/** Sol nascendo sobre as ondas do calçadão — gráfico da campanha. */
function SolNoMar() {
  return (
    <svg
      viewBox="0 0 320 220"
      className="mx-auto w-full max-w-xs md:max-w-sm"
      aria-hidden
    >
      {/* raios */}
      {[-60, -30, 0, 30, 60].map((deg) => (
        <line
          key={deg}
          x1="160"
          y1="34"
          x2="160"
          y2="12"
          stroke="var(--color-gold)"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${deg} 160 108)`}
        />
      ))}
      {/* sol (meio mergulhado) */}
      <path d="M 92 130 A 68 68 0 0 1 228 130 Z" fill="var(--color-sun)" />
      {/* ondas do calçadão */}
      {[148, 172, 196].map((y, i) => (
        <path
          key={y}
          d={`M0 ${y} Q 20 ${y - 14} 40 ${y} T 80 ${y} T 120 ${y} T 160 ${y} T 200 ${y} T 240 ${y} T 280 ${y} T 320 ${y}`}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="5"
          opacity={1 - i * 0.32}
        />
      ))}
    </svg>
  );
}

export function CampaignSection({ campaign }: { campaign: Campaign }) {
  return (
    <section className="bg-primary">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:gap-12 md:px-6 md:py-24">
        <div>
          <p className="label-caps text-sun">Campanha ativa</p>
          <h2 className="mt-4 font-display text-4xl font-medium italic leading-[1.1] text-bg-light md:text-5xl">
            {campaign.title}
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-bg-light/80 md:text-lg">
            {campaign.text}
          </p>
          <Link
            href={`/campanha/${campaign.slug}`}
            className="mt-8 inline-block rounded-full bg-sun px-8 py-4 font-semibold text-on-sun transition-transform duration-300 hover:scale-[1.03]"
          >
            {campaign.ctaLabel}
          </Link>
        </div>

        <SolNoMar />
      </div>
    </section>
  );
}
