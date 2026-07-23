"use client";

import { createClient } from "@/lib/supabase/client";

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAX_MB = 4;

/**
 * Envia uma imagem para o bucket público `product-images`
 * (permitido só para admins pelas policies de Storage) e
 * devolve a URL pública. Aceita jpg/png/webp até 4 MB.
 */
export async function uploadImagem(
  file: File,
  pasta: "products" | "campaigns" | "content",
): Promise<string> {
  if (!TIPOS_ACEITOS.includes(file.type)) {
    throw new Error("Formato não aceito — envie JPG, PNG ou WebP.");
  }
  if (file.size > TAMANHO_MAX_MB * 1024 * 1024) {
    throw new Error(`Imagem muito grande — o limite é ${TAMANHO_MAX_MB} MB.`);
  }

  const supabase = createClient();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${pasta}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error("Falha no envio da imagem. Tente de novo.");

  return supabase.storage.from("product-images").getPublicUrl(path).data
    .publicUrl;
}
