"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { revalidarSitePublico } from "@/lib/admin/revalidar";
import { slugify } from "@/lib/slug";

const imagemSchema = z.object({
  url: z
    .string()
    .max(500)
    .refine(
      (u) => u.startsWith("/") || u.startsWith("https://"),
      "URL de imagem inválida",
    ),
  alt: z.string().max(300).default(""),
});

const produtoSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(80).optional(),
  categoryId: z.string().uuid().nullable(),
  price: z.coerce.number().min(0).max(100000),
  promoPrice: z.coerce.number().min(0).max(100000).nullable(),
  description: z.string().max(2000).default(""),
  materials: z.string().max(1000).default(""),
  sizeInfo: z.string().max(1000).default(""),
  isNew: z.boolean(),
  featured: z.boolean(),
  soldOut: z.boolean(),
  active: z.boolean(),
  stock: z.coerce.number().int().min(0).max(9999).nullable(),
  images: z.array(imagemSchema).max(10),
});

export type ProdutoInput = z.input<typeof produtoSchema>;

function rowFromInput(data: z.output<typeof produtoSchema>) {
  return {
    name: data.name,
    slug: data.slug ? slugify(data.slug) : slugify(data.name),
    category_id: data.categoryId,
    price: data.price,
    promo_price: data.promoPrice,
    description: data.description,
    materials: data.materials,
    size_info: data.sizeInfo,
    is_new: data.isNew,
    featured: data.featured,
    sold_out: data.soldOut,
    active: data.active,
    stock: data.stock,
  };
}

async function salvarImagens(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  productId: string,
  images: z.output<typeof produtoSchema>["images"],
) {
  await supabase.from("product_images").delete().eq("product_id", productId);
  if (images.length > 0) {
    const { error } = await supabase.from("product_images").insert(
      images.map((img, i) => ({
        product_id: productId,
        url: img.url,
        alt: img.alt,
        sort_order: i,
      })),
    );
    if (error) throw error;
  }
}

export async function criarProduto(input: ProdutoInput) {
  const { supabase } = await requireAdmin();
  const data = produtoSchema.parse(input);

  const { data: created, error } = await supabase
    .from("products")
    .insert(rowFromInput(data))
    .select("id")
    .single();
  if (error) {
    return { erro: error.code === "23505" ? "Já existe uma peça com esse slug." : "Não deu pra salvar. Tente de novo." };
  }

  await salvarImagens(supabase, created.id, data.images);
  revalidatePath("/admin/produtos");
  revalidarSitePublico();
  redirect("/admin/produtos?salvo=1");
}

export async function atualizarProduto(id: string, input: ProdutoInput) {
  const { supabase } = await requireAdmin();
  const idOk = z.string().uuid().parse(id);
  const data = produtoSchema.parse(input);

  const { error } = await supabase
    .from("products")
    .update(rowFromInput(data))
    .eq("id", idOk);
  if (error) {
    return { erro: error.code === "23505" ? "Já existe uma peça com esse slug." : "Não deu pra salvar. Tente de novo." };
  }

  await salvarImagens(supabase, idOk, data.images);
  revalidatePath("/admin/produtos");
  revalidarSitePublico();
  redirect("/admin/produtos?salvo=1");
}

export async function excluirProduto(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/produtos");
  revalidarSitePublico();
  redirect("/admin/produtos?excluido=1");
}
