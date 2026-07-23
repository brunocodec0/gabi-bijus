import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-bg px-4 py-24 text-center">
      <p
        aria-hidden
        className="font-display text-[clamp(5rem,20vw,10rem)] font-semibold italic leading-none text-gold/60"
      >
        404
      </p>
      <h1 className="mt-4 text-3xl font-medium md:text-4xl">
        Essa onda <em className="squiggle">quebrou</em> em outra praia
      </h1>
      <p className="mt-4 max-w-md text-text/70">
        A página que você procura não existe (ou já voltou pro mar). Bora pro
        que interessa:
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
        <Link
          href="/"
          className="rounded-full bg-primary px-8 py-4 font-semibold text-bg-light transition-colors hover:bg-primary-dark"
        >
          Voltar ao início
        </Link>
        <Link
          href="/produtos"
          className="link-underline font-display italic text-earth"
        >
          ver as peças
        </Link>
      </div>
    </main>
  );
}
