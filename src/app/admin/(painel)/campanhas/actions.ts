"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { revalidarSitePublico } from "@/lib/admin/revalidar";
import { slugify } from "@/lib/slug";

const campanhaSchema = z.object({
  title: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(80).optional(),
  imageUrl: z
    .string()
    .max(500)
    .refine((u) => u === "" || u.startsWith("/") || u.startsWith("https://"))
    .transform((u) => (u === "" ? null : u)),
  body: z.string().max(2000).default(""),
  ctaLabel: z.string().trim().min(1).max(60),
  startsAt: z.string().transform((s) => (s === "" ? null : s)),
  endsAt: z.string().transform((s) => (s === "" ? null : s)),
  active: z.boolean(),
  productIds: z.array(z.string().uuid()).max(50),
});

export type CampanhaInput = z.input<typeof campanhaSchema>;

function rowFromInput(data: z.output<typeof campanhaSchema>) {
  return {
    title: data.title,
    slug: data.slug ? slugify(data.slug) : slugify(data.title),
    image_url: data.imageUrl,
    body: data.body,
    cta_label: data.ctaLabel,
    starts_at: data.startsAt,
    ends_at: data.endsAt,
    active: data.active,
  };
}

async function salvarProdutos(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  campaignId: string,
  productIds: string[],
) {
  await supabase
    .from("campaign_products")
    .delete()
    .eq("campaign_id", campaignId);
  if (productIds.length > 0) {
    await supabase.from("campaign_products").insert(
      productIds.map((pid) => ({ campaign_id: campaignId, product_id: pid })),
    );
  }
}

export async function criarCampanha(input: CampanhaInput) {
  const { supabase } = await requireAdmin();
  const data = campanhaSchema.parse(input);

  const { data: created, error } = await supabase
    .from("campaigns")
    .insert(rowFromInput(data))
    .select("id")
    .single();
  if (error) {
    return {
      erro:
        error.code === "23505"
          ? "Já existe uma campanha com esse slug."
          : "Não deu pra salvar. Tente de novo.",
    };
  }

  await salvarProdutos(supabase, created.id, data.productIds);
  revalidatePath("/admin/campanhas");
  revalidarSitePublico();
  redirect("/admin/campanhas?salvo=1");
}

export async function atualizarCampanha(id: string, input: CampanhaInput) {
  const { supabase } = await requireAdmin();
  const idOk = z.string().uuid().parse(id);
  const data = campanhaSchema.parse(input);

  const { error } = await supabase
    .from("campaigns")
    .update(rowFromInput(data))
    .eq("id", idOk);
  if (error) {
    return {
      erro:
        error.code === "23505"
          ? "Já existe uma campanha com esse slug."
          : "Não deu pra salvar. Tente de novo.",
    };
  }

  await salvarProdutos(supabase, idOk, data.productIds);
  revalidatePath("/admin/campanhas");
  revalidarSitePublico();
  redirect("/admin/campanhas?salvo=1");
}

export async function excluirCampanha(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  await supabase.from("campaigns").delete().eq("id", id);
  revalidatePath("/admin/campanhas");
  revalidarSitePublico();
  redirect("/admin/campanhas?excluido=1");
}

/**
 * Ativa a campanha e marca todos os seus produtos como "à venda no site".
 * Permite preparar uma coleção em rascunho e lançar tudo de uma vez.
 */
export async function lancarColecao(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));

  const { data: cp } = await supabase
    .from("campaign_products")
    .select("product_id")
    .eq("campaign_id", id);

  const productIds = (cp ?? []).map((r: { product_id: string }) => r.product_id);

  await Promise.all([
    supabase.from("campaigns").update({ active: true }).eq("id", id),
    productIds.length > 0
      ? supabase.from("products").update({ active: true }).in("id", productIds)
      : Promise.resolve(),
  ]);

  revalidatePath("/admin/campanhas");
  revalidarSitePublico();
  redirect(`/admin/campanhas/${id}?lancada=1`);
}
