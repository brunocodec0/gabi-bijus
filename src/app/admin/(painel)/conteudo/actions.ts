"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { revalidarSitePublico } from "@/lib/admin/revalidar";

const urlOuCaminho = z
  .string()
  .max(500)
  .refine((u) => u.startsWith("/") || u.startsWith("https://"));

const conteudoSchema = z.object({
  hero: z.object({
    tagline: z.string().trim().min(1).max(120),
    highlight: z.string().trim().min(1).max(40),
    subtitle: z.string().trim().max(300),
  }),
  marquee: z.object({
    words: z.array(z.string().trim().min(1).max(40)).min(1).max(8),
  }),
  sobre: z.object({
    title: z.string().trim().min(1).max(120),
    text: z.string().trim().max(2000),
  }),
  instagram: z.object({
    handle: z.string().trim().min(1).max(60),
    url: z.string().url().max(200),
    images: z
      .array(z.object({ src: urlOuCaminho, alt: z.string().max(300) }))
      .max(12),
  }),
  contato: z.object({
    whatsapp: z
      .string()
      .trim()
      .regex(/^\d{10,15}$/, "Número inválido")
      .nullable(),
  }),
  rodape: z.object({
    nota: z.string().trim().max(200),
    cuidados: z.string().trim().max(500),
  }),
  politica: z.object({
    trocas: z.string().trim().max(2000),
  }),
});

export type ConteudoInput = z.input<typeof conteudoSchema>;

export async function salvarConteudo(input: ConteudoInput) {
  const { supabase } = await requireAdmin();

  const parsed = conteudoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      erro:
        "Confira os campos: " +
        parsed.error.issues
          .map((i) => i.path.join(".") || "geral")
          .slice(0, 3)
          .join(", "),
    };
  }

  const { error } = await supabase.from("site_content").upsert(
    Object.entries(parsed.data).map(([key, value]) => ({ key, value })),
    { onConflict: "key" },
  );
  if (error) return { erro: "Não deu pra salvar. Tente de novo." };

  revalidatePath("/admin/conteudo");
  revalidarSitePublico();
  return { ok: true as const };
}
