"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { revalidarSitePublico } from "@/lib/admin/revalidar";
import { TRANSPORTADORAS } from "@/lib/transportadoras";

const seoSchema = z.object({
  nome: z.string().trim().min(1).max(80),
  descricao: z.string().trim().max(300),
  ogImage: z
    .string()
    .max(500)
    .refine((u) => u === "" || u.startsWith("/") || u.startsWith("https://"))
    .transform((u) => (u === "" ? null : u)),
});

export async function salvarSeo(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = seoSchema.safeParse({
    nome: formData.get("nome"),
    descricao: formData.get("descricao"),
    ogImage: formData.get("ogImage") ?? "",
  });
  if (!parsed.success) return { erro: "Confira os campos de SEO." };

  const { error } = await supabase.from("site_content").upsert(
    {
      key: "seo",
      value: {
        nome: parsed.data.nome,
        descricao: parsed.data.descricao,
        og_image: parsed.data.ogImage,
      },
    },
    { onConflict: "key" },
  );
  if (error) return { erro: "Não deu pra salvar." };

  revalidarSitePublico();
  return { ok: true as const };
}

const freteSchema = z.object({
  cepOrigem: z
    .string()
    .transform((s) => s.replace(/\D/g, ""))
    .pipe(z.string().length(8, "CEP de origem inválido (8 dígitos).")),
  pesoG: z.coerce.number().int().min(1).max(30000),
  alturaCm: z.coerce.number().min(1).max(120),
  larguraCm: z.coerce.number().min(1).max(120),
  comprimentoCm: z.coerce.number().min(1).max(120),
  empresas: z
    .array(z.enum(TRANSPORTADORAS))
    .min(1, "Escolha pelo menos uma transportadora."),
});

export async function salvarFrete(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = freteSchema.safeParse({
    cepOrigem: formData.get("cepOrigem"),
    pesoG: formData.get("pesoG"),
    alturaCm: formData.get("alturaCm"),
    larguraCm: formData.get("larguraCm"),
    comprimentoCm: formData.get("comprimentoCm"),
    empresas: formData.getAll("empresas"),
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0].message ?? "Confira os campos." };
  }

  const { error } = await supabase.from("site_content").upsert(
    {
      key: "frete",
      value: {
        cep_origem: parsed.data.cepOrigem,
        peso_g: parsed.data.pesoG,
        altura_cm: parsed.data.alturaCm,
        largura_cm: parsed.data.larguraCm,
        comprimento_cm: parsed.data.comprimentoCm,
        empresas: parsed.data.empresas,
      },
    },
    { onConflict: "key" },
  );
  if (error) return { erro: "Não deu pra salvar." };

  revalidarSitePublico();
  return { ok: true as const };
}

const senhaSchema = z
  .string()
  .min(8, "A senha precisa de pelo menos 8 caracteres.")
  .max(100);

export async function trocarSenha(formData: FormData) {
  const { supabase } = await requireAdmin();

  const senha = senhaSchema.safeParse(formData.get("senha"));
  const confirma = formData.get("confirma");
  if (!senha.success) return { erro: senha.error.issues[0].message };
  if (senha.data !== confirma) return { erro: "As senhas não conferem." };

  const { error } = await supabase.auth.updateUser({ password: senha.data });
  if (error) return { erro: "Não deu pra trocar a senha. Tente de novo." };

  return { ok: true as const };
}
