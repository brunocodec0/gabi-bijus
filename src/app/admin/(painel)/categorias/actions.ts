"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { revalidarSitePublico } from "@/lib/admin/revalidar";
import { slugify } from "@/lib/slug";

const nomeSchema = z.string().trim().min(2).max(60);

export async function criarCategoria(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = nomeSchema.parse(formData.get("name"));

  const { data: max } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("categories").insert({
    name,
    slug: slugify(name),
    sort_order: (max?.sort_order ?? 0) + 1,
  });
  revalidatePath("/admin/categorias");
  revalidarSitePublico();
}

export async function renomearCategoria(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  const name = nomeSchema.parse(formData.get("name"));
  await supabase
    .from("categories")
    .update({ name, slug: slugify(name) })
    .eq("id", id);
  revalidatePath("/admin/categorias");
  revalidarSitePublico();
}

export async function excluirCategoria(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  // Produtos da categoria ficam "Sem categoria" (FK on delete set null)
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categorias");
  revalidarSitePublico();
}

export async function moverCategoria(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  const dir = z.enum(["cima", "baixo"]).parse(formData.get("dir"));

  const { data: todas } = await supabase
    .from("categories")
    .select("id,sort_order")
    .order("sort_order");
  if (!todas) return;

  const i = todas.findIndex((c) => c.id === id);
  const j = dir === "cima" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= todas.length) return;

  await Promise.all([
    supabase
      .from("categories")
      .update({ sort_order: todas[j].sort_order })
      .eq("id", todas[i].id),
    supabase
      .from("categories")
      .update({ sort_order: todas[i].sort_order })
      .eq("id", todas[j].id),
  ]);
  revalidatePath("/admin/categorias");
  revalidarSitePublico();
}
