import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Stamp } from "@/components/site/Stamp";
import { WaveDivider } from "@/components/site/WaveDivider";
import { getSiteContent } from "@/lib/data";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "A história da Gabi Bijus: bijuterias artesanais feitas à mão no Rio de Janeiro, uma a uma, com afeto e sol.",
};

// Textos vêm do banco (site_content) — editáveis no painel em
// "Conteúdo do site". As fotos usam o grid do Instagram por enquanto;
// quando as fotos reais chegarem, a lojista troca pelo painel.
export default async function SobrePage() {
  const content = await getSiteContent();
  const [tituloInicio, tituloResto] = content.aboutTitle.includes(",")
    ? [
        content.aboutTitle.split(",")[0] + ",",
        content.aboutTitle.split(",").slice(1).join(","),
      ]
    : [content.aboutTitle, ""];
  const fotos = content.instagramImages.slice(0, 3);

  return (
    <>
      {/* Manifesto */}
      <section className="relative overflow-hidden bg-bg">
        <Stamp className="absolute right-4 top-8 h-24 w-24 text-earth md:right-12 md:top-12 md:h-32 md:w-32" />
        <div className="mx-auto max-w-3xl px-4 pb-14 pt-14 md:px-6 md:pb-20 md:pt-24">
          <p className="label-caps text-earth">Sobre a marca</p>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,4.4rem)] font-medium leading-[1.08] tracking-tight">
            {tituloInicio}
            {tituloResto && (
              <>
                <br />
                <em className="text-earth">{tituloResto.trim()}</em>
              </>
            )}
          </h1>
          <p className="mt-8 max-w-2xl font-display text-xl italic leading-relaxed text-text/80 md:text-2xl">
            {content.aboutText}
          </p>
          <p className="mt-6 font-display text-lg italic text-earth">
            — Gabi ☀
          </p>
        </div>
      </section>

      <WaveDivider id="sobre-wave" className="bg-bg text-earth/25" />

      {/* Fotos — colagem levemente torta, como na mesa do ateliê */}
      <section className="overflow-hidden bg-bg-light">
        <div className="mx-auto max-w-5xl px-4 py-14 md:px-6 md:py-20">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {fotos.map((foto, i) => (
              <div
                key={foto.src}
                className={`bg-white p-1.5 pb-6 shadow-[0_2px_12px_rgba(43,29,20,0.1)] md:p-2.5 md:pb-9 ${
                  i === 0 ? "-rotate-2" : i === 1 ? "rotate-1 md:mt-8" : "rotate-2"
                }`}
              >
                <span className="relative block aspect-[4/5] overflow-hidden">
                  <Image
                    src={foto.src}
                    alt={foto.alt}
                    fill
                    sizes="(max-width: 768px) 33vw, 300px"
                    className="object-cover"
                  />
                </span>
              </div>
            ))}
          </div>

          {/* O processo */}
          <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:mt-20 md:grid-cols-3">
            {[
              {
                n: "01",
                titulo: "Garimpo",
                texto:
                  "Pedras, conchas e dourados escolhidos no olho — cada leva é diferente, como a maré.",
              },
              {
                n: "02",
                titulo: "Bancada",
                texto:
                  "Arame dobrado à mão, peça por peça, sem pressa e sem produção em série.",
              },
              {
                n: "03",
                titulo: "Pra você",
                texto:
                  "Embalada com carinho e enviada com cheiro de verão, direto do Rio.",
              },
            ].map((etapa) => (
              <div key={etapa.n}>
                <p className="label-caps text-text/40">Nº {etapa.n}</p>
                <h2 className="mt-1 font-display text-2xl font-medium text-primary">
                  {etapa.titulo}
                </h2>
                <p className="mt-2 leading-relaxed text-text/70">
                  {etapa.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cuidados + CTA */}
      <section className="bg-bg">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center md:px-6 md:py-20">
          <p
            aria-hidden
            className="font-display text-6xl leading-none text-gold"
          >
            ☀
          </p>
          <h2 className="mt-3 text-2xl font-medium md:text-3xl">
            Pra sua biju viver um <em className="squiggle">verão eterno</em>
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-text/70">
            {content.careNote}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
            <Link
              href="/produtos"
              className="rounded-full bg-primary px-8 py-4 font-semibold text-bg-light transition-colors hover:bg-primary-dark"
            >
              Ver as peças
            </Link>
            <Link
              href="/trocas-e-cuidados"
              className="link-underline font-display italic text-earth"
            >
              trocas e cuidados
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
