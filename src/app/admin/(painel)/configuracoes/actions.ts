"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { revalidarSitePublico } from "@/lib/admin/revalidar";
import { TRANSPORTADORAS } from "@/lib/transportadoras";
import { CORES_DO_TEMA, HEX_RE } from "@/lib/tema";

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

const soDigitos = (s: string) => s.replace(/\D/g, "");

const faixaCepSchema = z.object({
  de: z.string().transform(soDigitos).pipe(z.string().length(8)),
  ate: z.string().transform(soDigitos).pipe(z.string().length(8)),
});

const expressaSchema = z.object({
  ativo: z.boolean(),
  label: z.string().trim().min(1).max(80),
  valor: z.coerce.number().min(0).max(100000).nullable(),
  faixas: z.array(faixaCepSchema).max(30),
});

export type EntregaExpressaInput = z.input<typeof expressaSchema>;

export async function salvarEntregaExpressa(input: EntregaExpressaInput) {
  const { supabase } = await requireAdmin();

  const parsed = expressaSchema.safeParse(input);
  if (!parsed.success) {
    return { erro: "Confira o CEP das faixas (8 dígitos cada)." };
  }
  const dados = parsed.data;
  // Ativa sem nenhuma faixa nunca casaria — melhor avisar do que salvar
  // uma opção que jamais apareceria.
  if (dados.ativo && dados.faixas.length === 0) {
    return { erro: "Adicione ao menos uma faixa de CEP para ativar." };
  }
  // de > ate inverteria a faixa e nunca casaria.
  const invertida = dados.faixas.find((f) => Number(f.de) > Number(f.ate));
  if (invertida) {
    return { erro: `Na faixa ${invertida.de}, o CEP inicial é maior que o final.` };
  }

  // A entrega expressa mora dentro da chave "frete"; preserva o resto.
  const { data: atual } = await supabase
    .from("site_content")
    .select("value")
    .eq("key", "frete")
    .maybeSingle();
  const base = (atual?.value ?? {}) as Record<string, unknown>;

  const { error } = await supabase.from("site_content").upsert(
    { key: "frete", value: { ...base, expressa: dados } },
    { onConflict: "key" },
  );
  if (error) return { erro: "Não deu pra salvar a entrega expressa." };

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

/* ── Cores do site ────────────────────────────────────────────── */

// Só #rrggbb entra no banco. Além de evitar cor quebrada, isso é o
// que garante que nada além de uma cor chegue na tag <style> do site.
const corSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(HEX_RE, "Cor inválida");

const temaSchema = z.object(
  Object.fromEntries(CORES_DO_TEMA.map((c) => [c.id, corSchema])),
);

export async function salvarTema(formData: FormData) {
  const { supabase } = await requireAdmin();

  const parsed = temaSchema.safeParse(
    Object.fromEntries(CORES_DO_TEMA.map((c) => [c.id, formData.get(c.id)])),
  );
  if (!parsed.success) {
    const campo = parsed.error.issues[0]?.path[0];
    const cor = CORES_DO_TEMA.find((c) => c.id === campo);
    return {
      erro: cor
        ? `A cor “${cor.label}” está inválida. Use o seletor de cor.`
        : "Confira as cores.",
    };
  }

  const { error } = await supabase
    .from("site_content")
    .upsert({ key: "tema", value: parsed.data }, { onConflict: "key" });
  if (error) return { erro: "Não deu pra salvar as cores." };

  revalidatePath("/admin/configuracoes");
  revalidarSitePublico();
  return { ok: true as const };
}
