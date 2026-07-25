"use client";

import { createClient } from "@/lib/supabase/client";

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];

/** Guarda contra arquivo absurdo. O que a lojista envia é encolhido antes. */
const TAMANHO_MAX_MB = 30;
/** Maior lado da foto depois de redimensionar (cobre iPad retina e o hero em tela cheia). */
const LADO_MAX = 2560;
/**
 * Alvo de tamanho depois de comprimir. Folgado de propósito: é loja de
 * bijuteria, onde brilho e detalhe fino importam, e o hero amplia tudo
 * em tela cheia — melhor 2 MB nítido do que 300 KB borrado.
 */
const ALVO_MB = 2.5;
/** Qualidades tentadas em ordem, até o arquivo caber no alvo. Começa alto. */
const QUALIDADES = [0.92, 0.86, 0.8];

function mb(bytes: number) {
  return bytes / (1024 * 1024);
}

function paraBlob(
  canvas: HTMLCanvasElement,
  tipo: string,
  qualidade: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, tipo, qualidade));
}

/**
 * Encolhe a foto no navegador antes de subir.
 *
 * Foto de câmera vem com ~4000px e 5 MB, mas a loja nunca mostra mais
 * que ~2400px — subir o arquivo cru só deixaria o site lento para as
 * clientes e encheria o armazenamento à toa. Aqui a imagem é
 * redimensionada e recomprimida (WebP quando o navegador topa, senão
 * JPEG), o que costuma levar 5 MB para menos de 1 MB sem diferença
 * visível na tela.
 *
 * `imageOrientation: "from-image"` respeita o EXIF — sem isso, foto
 * tirada em pé subiria deitada.
 *
 * Em qualquer imprevisto devolve o arquivo original: é melhor enviar
 * a foto grande do que travar a lojista.
 */
async function encolher(
  file: File,
): Promise<{ dados: Blob; tipo: string }> {
  const original = { dados: file as Blob, tipo: file.type };
  if (typeof createImageBitmap !== "function") return original;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return original;
  }

  const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
  // Já é pequena e cabe na tela: não mexe (evita recomprimir à toa).
  if (escala === 1 && mb(file.size) <= ALVO_MB) {
    bitmap.close();
    return original;
  }

  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return original;
  }
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();

  // WebP preserva transparência e comprime melhor; se o navegador não
  // souber gerar, o toBlob devolve outro tipo e caímos no JPEG.
  let tipoSaida = "image/webp";
  let saida: Blob | null = null;

  for (const qualidade of QUALIDADES) {
    saida = await paraBlob(canvas, tipoSaida, qualidade);
    if (saida && saida.type !== tipoSaida) {
      tipoSaida = "image/jpeg";
      saida = await paraBlob(canvas, tipoSaida, qualidade);
    }
    if (saida && mb(saida.size) <= ALVO_MB) break;
  }

  // Se algo deu errado ou o "otimizado" ficou maior, fica com o original.
  if (!saida || saida.size >= file.size) return original;
  return { dados: saida, tipo: tipoSaida };
}

/**
 * Envia uma imagem para o bucket público `product-images`
 * (permitido só para admins pelas policies de Storage) e
 * devolve a URL pública. A foto é encolhida antes do envio.
 */
export async function uploadImagem(
  file: File,
  pasta: "products" | "campaigns" | "content",
): Promise<string> {
  if (!TIPOS_ACEITOS.includes(file.type)) {
    throw new Error(
      "Formato não aceito — envie JPG, PNG ou WebP. (Foto de iPhone pode " +
        "estar em HEIC: em Ajustes → Câmera → Formatos, escolha “Mais compatível”.)",
    );
  }
  if (mb(file.size) > TAMANHO_MAX_MB) {
    throw new Error(
      `Essa imagem tem ${mb(file.size).toFixed(1)} MB e é grande demais ` +
        `(limite ${TAMANHO_MAX_MB} MB).`,
    );
  }

  const { dados, tipo } = await encolher(file);

  const supabase = createClient();
  const ext =
    tipo === "image/png" ? "png" : tipo === "image/jpeg" ? "jpg" : "webp";
  const path = `${pasta}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, dados, { contentType: tipo, upsert: false });
  if (error) throw new Error("Falha no envio da imagem. Tente de novo.");

  return supabase.storage.from("product-images").getPublicUrl(path).data
    .publicUrl;
}
