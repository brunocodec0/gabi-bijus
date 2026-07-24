import { createPublicClient } from "@/lib/supabase/public";
import * as mock from "./mock";
import { normalizarTema, TEMA_PADRAO, type Tema } from "./tema";
import type { Campaign, Category, Product, SiteContent } from "./types";

/**
 * Camada de dados do site público (só servidor).
 * Lê do Supabase quando NEXT_PUBLIC_SUPABASE_URL está configurada;
 * sem credenciais (ou em erro), cai no mock para o site nunca quebrar.
 */

const hasSupabase =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  promo_price: number | null;
  description: string;
  materials: string;
  size_info: string;
  is_new: boolean;
  featured: boolean;
  sold_out: boolean;
  stock: number | null;
  categories: { name: string } | null;
  product_images: { url: string; alt: string; sort_order: number }[];
}

const PRODUCT_SELECT =
  "id,name,slug,price,promo_price,description,materials,size_info,is_new,featured,sold_out,stock,categories(name),product_images(url,alt,sort_order)";

function mapProduct(row: ProductRow): Product {
  const images = [...row.product_images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => ({ src: i.url, alt: i.alt || row.name }));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.categories?.name ?? "",
    price: Number(row.price),
    promoPrice: row.promo_price !== null ? Number(row.promo_price) : undefined,
    images: images.length > 0 ? images : [{ src: "/placeholders/p1.svg", alt: row.name }],
    badge: row.sold_out
      ? "esgotado"
      : row.stock !== null && row.stock > 0 && row.stock <= 3
        ? "ultimas"
        : row.is_new
          ? "novo"
          : undefined,
    featured: row.featured,
    description: row.description,
    materials: row.materials,
    sizeInfo: row.size_info,
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!hasSupabase) return mock.products;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as ProductRow[]).map(mapProduct);
  } catch (err) {
    console.error("[data] getProducts falhou, usando mock:", err);
    return mock.products;
  }
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  if (!hasSupabase) return mock.getProductBySlug(slug);
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("active", true)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProduct(data as unknown as ProductRow) : undefined;
  } catch (err) {
    console.error("[data] getProductBySlug falhou, usando mock:", err);
    return mock.getProductBySlug(slug);
  }
}

/** Relacionados: mesma categoria primeiro, depois o resto. */
export function relatedProducts(
  all: Product[],
  product: Product,
  limit = 4,
): Product[] {
  const same = all.filter(
    (p) => p.category === product.category && p.id !== product.id,
  );
  const others = all.filter(
    (p) => p.category !== product.category && p.id !== product.id,
  );
  return [...same, ...others].slice(0, limit);
}

export async function getCategories(): Promise<Category[]> {
  if (!hasSupabase) return mock.categories;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("name,slug")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("[data] getCategories falhou, usando mock:", err);
    return mock.categories;
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!hasSupabase) return mock.siteContent;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("site_content").select("key,value");
    if (error) throw error;

    const map = Object.fromEntries(
      data.map((r: { key: string; value: Record<string, unknown> }) => [
        r.key,
        r.value,
      ]),
    );
    const fb = mock.siteContent; // valores padrão se alguma chave faltar

    return {
      heroTagline: (map.hero?.tagline as string) ?? fb.heroTagline,
      heroHighlight: (map.hero?.highlight as string) ?? fb.heroHighlight,
      heroSubtitle: (map.hero?.subtitle as string) ?? fb.heroSubtitle,
      marqueeWords: (map.marquee?.words as string[]) ?? fb.marqueeWords,
      aboutTitle: (map.sobre?.title as string) ?? fb.aboutTitle,
      aboutText: (map.sobre?.text as string) ?? fb.aboutText,
      instagramHandle: (map.instagram?.handle as string) ?? fb.instagramHandle,
      instagramUrl: (map.instagram?.url as string) ?? fb.instagramUrl,
      instagramImages:
        (map.instagram?.images as { src: string; alt: string }[]) ??
        fb.instagramImages,
      whatsappNumber:
        (map.contato?.whatsapp as string | null) ??
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
        null,
      footerNote: (map.rodape?.nota as string) ?? fb.footerNote,
      careNote: (map.rodape?.cuidados as string) ?? fb.careNote,
      politicaTrocas: (map.politica?.trocas as string) ?? fb.politicaTrocas,
    };
  } catch (err) {
    console.error("[data] getSiteContent falhou, usando mock:", err);
    return mock.siteContent;
  }
}

export interface CampaignWithProducts extends Campaign {
  products: Product[];
}

/** Campanha por slug (só ativas, pela RLS) com as peças vinculadas. */
export async function getCampaignBySlug(
  slug: string,
): Promise<CampaignWithProducts | null> {
  if (!hasSupabase) {
    if (slug !== mock.campaign.slug) return null;
    return { ...mock.campaign, products: mock.products.filter((p) => p.featured) };
  }
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("campaigns")
      .select(
        `title,slug,image_url,body,cta_label,campaign_products(products(${PRODUCT_SELECT}))`,
      )
      .eq("active", true)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const rows = (
      data.campaign_products as unknown as { products: ProductRow | null }[]
    )
      .map((cp) => cp.products)
      .filter((p): p is ProductRow => p !== null);

    return {
      title: data.title,
      slug: data.slug,
      image: data.image_url ?? "/placeholders/p4.svg",
      text: data.body,
      ctaLabel: data.cta_label,
      products: rows.map(mapProduct),
    };
  } catch (err) {
    console.error("[data] getCampaignBySlug falhou:", err);
    return null;
  }
}

/** Frete disponível quando há token do Melhor Envio + CEP de origem configurado. */
export async function getFreteDisponivel(): Promise<boolean> {
  if (!process.env.MELHOR_ENVIO_TOKEN || !hasSupabase) return false;
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "frete")
      .maybeSingle();
    return !!(data?.value as { cep_origem?: string } | null)?.cep_origem;
  } catch {
    return false;
  }
}

export async function getActiveCampaign(): Promise<Campaign | null> {
  if (!hasSupabase) return mock.campaign;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("campaigns")
      .select("title,slug,image_url,body,cta_label")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      title: data.title,
      slug: data.slug,
      image: data.image_url ?? "/placeholders/p4.svg",
      text: data.body,
      ctaLabel: data.cta_label,
    };
  } catch (err) {
    console.error("[data] getActiveCampaign falhou, usando mock:", err);
    return mock.campaign;
  }
}

/**
 * Cores do site escolhidas no painel (site_content, chave "tema").
 * Sem banco, sem registro ou com valor inválido → paleta original.
 */
export async function getTema(): Promise<Tema> {
  if (!hasSupabase) return TEMA_PADRAO;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "tema")
      .maybeSingle();
    if (error) throw error;
    return normalizarTema(data?.value);
  } catch (err) {
    console.error("[data] getTema falhou, usando paleta padrão:", err);
    return TEMA_PADRAO;
  }
}
