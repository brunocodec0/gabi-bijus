import Link from "next/link";
import type { SiteContent } from "@/lib/types";

export function AboutSection({ content }: { content: SiteContent }) {
  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-6 md:py-28">
        <p
          aria-hidden
          className="font-display text-7xl leading-none text-gold md:text-8xl"
        >
          &ldquo;
        </p>
        <h2 className="mt-2 text-3xl font-medium md:text-4xl">
          A mão da Gabi, <em className="text-earth">o tempo do mar</em>
        </h2>
        <p className="mx-auto mt-7 max-w-xl font-display text-xl italic leading-relaxed text-text/80 md:text-2xl">
          {content.aboutText}
        </p>
        <p className="mt-7 font-display text-lg italic text-earth">— Gabi ☀</p>
        <Link
          href="/sobre"
          className="link-underline mt-8 inline-block font-medium text-primary"
        >
          Conhecer a história
        </Link>
      </div>
    </section>
  );
}
