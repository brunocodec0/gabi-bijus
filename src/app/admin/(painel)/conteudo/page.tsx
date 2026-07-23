import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getSiteContent } from "@/lib/data";
import { ConteudoForm } from "./ConteudoForm";

export const metadata: Metadata = { title: "Conteúdo do site" };

export default async function AdminConteudo() {
  await requireAdmin();
  const content = await getSiteContent();

  return (
    <div>
      <h1 className="text-3xl font-medium">Conteúdo do site</h1>
      <p className="mt-2 text-sm text-text/60">
        Tudo o que você salvar aqui muda no site na hora.
      </p>
      <div className="mt-7">
        <ConteudoForm
          inicial={{
            heroTagline: content.heroTagline,
            heroHighlight: content.heroHighlight,
            heroSubtitle: content.heroSubtitle,
            marqueeWords: content.marqueeWords,
            aboutTitle: content.aboutTitle,
            aboutText: content.aboutText,
            instagramHandle: content.instagramHandle,
            instagramUrl: content.instagramUrl,
            instagramImages: content.instagramImages,
            whatsapp: content.whatsappNumber ?? "",
            footerNote: content.footerNote,
            careNote: content.careNote,
            politicaTrocas: content.politicaTrocas,
          }}
        />
      </div>
    </div>
  );
}
