"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { revalidarSitePublico } from "@/lib/admin/revalidar";

const cupomSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(
        /^[A-Z0-9-]{3,30}$/,
        "Código: use 3 a 30 letras, números ou hífen (sem espaços).",
      ),
    kind: z.enum(["percent", "fixed"]),
    value: z.coerce.number().positive("Valor precisa ser maior que zero."),
    minSubtotal: z
      .string()
      .transform((s) => (s.trim() === "" ? null : Number(s.replace(",", "."))))
      .pipe(z.number().min(0).nullable()),
    endsAt: z.string().transform((s) => (s.trim() === "" ? null : s)),
  })
  .refine((d) => d.kind !== "percent" || d.value <= 100, {
    message: "Desconto percentual não pode passar de 100%.",
  });

export async function criarCupom(formData: FormData) {
  const { supabase } = await requireAdmin();

  const parsed = cupomSchema.safeParse({
    code: formData.get("code"),
    kind: formData.get("kind"),
    value: String(formData.get("value") ?? "").replace(",", "."),
    minSubtotal: formData.get("minSubtotal") ?? "",
    endsAt: formData.get("endsAt") ?? "",
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("coupons").insert({
    code: parsed.data.code,
    kind: parsed.data.kind,
    value: parsed.data.value,
    min_subtotal: parsed.data.minSubtotal,
    ends_at: parsed.data.endsAt ? `${parsed.data.endsAt}T23:59:59-03:00` : null,
    active: true,
  });
  if (error) {
    return {
      erro:
        error.code === "23505"
          ? "Já existe um cupom com esse código."
          : "Não deu pra salvar. A migração 0003 já foi aplicada?",
    };
  }

  revalidatePath("/admin/cupons");
  revalidarSitePublico();
  return { ok: true as const };
}

export async function alternarCupom(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  const ativo = formData.get("ativo") === "true";
  await supabase.from("coupons").update({ active: !ativo }).eq("id", id);
  revalidatePath("/admin/cupons");
  revalidarSitePublico();
}

export async function excluirCupom(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  await supabase.from("coupons").delete().eq("id", id);
  revalidatePath("/admin/cupons");
  revalidarSitePublico();
}
