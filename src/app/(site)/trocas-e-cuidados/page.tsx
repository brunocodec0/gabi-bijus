import type { Metadata } from "next";
import { getSiteContent } from "@/lib/data";

export const metadata: Metadata = {
  title: "Trocas e cuidados",
};

// Conteúdo vem do banco (site_content) — editável pelo admin na Etapa 4.
export default async function TrocasPage() {
  const content = await getSiteContent();

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 md:px-6 md:py-20">
      <p className="label-caps text-earth">Política</p>
      <h1 className="mt-2 text-4xl font-medium">
        Trocas e <em className="squiggle">cuidados</em>
      </h1>

      <div className="mt-8 space-y-6 leading-relaxed text-text/80">
        <section>
          <h2 className="font-display text-xl font-medium text-text">
            Cuidados com as peças
          </h2>
          <p className="mt-2">{content.careNote}</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-medium text-text">
            Trocas
          </h2>
          <p className="mt-2">{content.politicaTrocas}</p>
        </section>
      </div>
    </div>
  );
}
