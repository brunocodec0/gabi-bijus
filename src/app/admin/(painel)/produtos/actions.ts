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
  // Enquadramento em % (50/50 = centro), usado no corte do hero.
  focalX: z.coerce.number().int().min(0).max(100).default(50),
  focalY: z.coerce.number().int().min(0).max(100).default(50),
});

/** Grupo de escolha: "Material" com ["Dourado", "Prata"]. */
const opcaoSchema = z.object({
  name: z.string().trim().min(1).max(60),
  values: z.array(z.string().trim().min(1).max(60)).max(20),
});

/**
 * Postgres para "coluna não existe" / "tabela não existe".
 * Enquanto a migração 0005 não roda, o painel continua salvando o
 * resto do produto em vez de travar a lojista por completo.
 */
const CODIGOS_SEM_MIGRACAO = ["42703", "42P01"];

function faltaMigracao(error: { code?: string } | null | undefined): boolean {
  return !!error?.code && CODIGOS_SEM_MIGRACAO.includes(error.code);
}

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
  inHero: z.boolean().default(false),
  heroOrder: z.coerce.number().int().min(0).max(999).default(0),
  options: z.array(opcaoSchema).max(5).default([]),
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

/** Campos que só existem depois da migração 0005. */
function camposDaMigracao(data: z.output<typeof produtoSchema>) {
  return { in_hero: data.inHero, hero_order: data.heroOrder };
}

async function salvarImagens(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  productId: string,
  images: z.output<typeof produtoSchema>["images"],
) {
  await supabase.from("product_images").delete().eq("product_id", productId);
  if (images.length === 0) return;

  const linhas = images.map((img, i) => ({
    product_id: productId,
    url: img.url,
    alt: img.alt,
    sort_order: i,
    focal_x: img.focalX,
    focal_y: img.focalY,
  }));

  const { error } = await supabase.from("product_images").insert(linhas);
  if (!error) return;
  if (!faltaMigracao(error)) throw error;

  // Sem a 0005 ainda: grava as fotos sem o enquadramento.
  const { error: erroLegado } = await supabase.from("product_images").insert(
    images.map((img, i) => ({
      product_id: productId,
      url: img.url,
      alt: img.alt,
      sort_order: i,
    })),
  );
  if (erroLegado) throw erroLegado;
}

/**
 * Regrava os grupos de escolha da peça ("Material", "Cor da cordinha").
 * Apaga e reinsere — os valores caem por cascata. Devolve false se a
 * migração 0005 ainda não rodou, para o painel avisar a lojista.
 */
async function salvarOpcoes(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  productId: string,
  options: z.output<typeof produtoSchema>["options"],
): Promise<boolean> {
  const { error: erroLimpeza } = await supabase
    .from("product_options")
    .delete()
    .eq("product_id", productId);
  if (faltaMigracao(erroLimpeza)) return false;

  // Grupo sem nenhum valor não vai pro banco: viraria um seletor
  // vazio que impediria a cliente de comprar.
  const validos = options.filter((o) => o.values.length > 0);
  if (validos.length === 0) return true;

  const { data: grupos, error } = await supabase
    .from("product_options")
    .insert(
      validos.map((o, i) => ({
        product_id: productId,
        name: o.name,
        sort_order: i,
      })),
    )
    .select("id,name");
  if (faltaMigracao(error)) return false;
  if (error) throw error;

  const valores = validos.flatMap((o) => {
    const grupo = grupos?.find((g) => g.name === o.name);
    if (!grupo) return [];
    return o.values.map((label, i) => ({
      option_id: grupo.id,
      label,
      sort_order: i,
    }));
  });
  if (valores.length === 0) return true;

  const { error: erroValores } = await supabase
    .from("product_option_values")
    .insert(valores);
  if (erroValores) throw erroValores;
  return true;
}

function mensagemDeErro(error: { code?: string }): string {
  return error.code === "23505"
    ? "Já existe uma peça com esse slug."
    : "Não deu pra salvar. Tente de novo.";
}

export async function criarProduto(input: ProdutoInput) {
  const { supabase } = await requireAdmin();
  const data = produtoSchema.parse(input);

  let { data: created, error } = await supabase
    .from("products")
    .insert({ ...rowFromInput(data), ...camposDaMigracao(data) })
    .select("id")
    .single();
  if (faltaMigracao(error)) {
    ({ data: created, error } = await supabase
      .from("products")
      .insert(rowFromInput(data))
      .select("id")
      .single());
  }
  if (error || !created) {
    return { erro: mensagemDeErro(error ?? {}) };
  }

  await salvarImagens(supabase, created.id, data.images);
  const comOpcoes = await salvarOpcoes(supabase, created.id, data.options);

  revalidatePath("/admin/produtos");
  revalidarSitePublico();
  redirect(`/admin/produtos?salvo=1${comOpcoes ? "" : "&migracao=pendente"}`);
}

export async function atualizarProduto(id: string, input: ProdutoInput) {
  const { supabase } = await requireAdmin();
  const idOk = z.string().uuid().parse(id);
  const data = produtoSchema.parse(input);

  let { error } = await supabase
    .from("products")
    .update({ ...rowFromInput(data), ...camposDaMigracao(data) })
    .eq("id", idOk);
  if (faltaMigracao(error)) {
    ({ error } = await supabase
      .from("products")
      .update(rowFromInput(data))
      .eq("id", idOk));
  }
  if (error) {
    return { erro: mensagemDeErro(error) };
  }

  await salvarImagens(supabase, idOk, data.images);
  const comOpcoes = await salvarOpcoes(supabase, idOk, data.options);

  revalidatePath("/admin/produtos");
  revalidarSitePublico();
  redirect(`/admin/produtos?salvo=1${comOpcoes ? "" : "&migracao=pendente"}`);
}

export async function excluirProduto(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/produtos");
  revalidarSitePublico();
  redirect("/admin/produtos?excluido=1");
}
