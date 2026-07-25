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
  product_images: {
    url: string;
    alt: string;
    sort_order: number;
    focal_x?: number;
    focal_y?: number;
  }[];
  // Só existem depois da migração 0005 — por isso opcionais.
  in_hero?: boolean;
  hero_order?: number;
  product_options?: {
    id: string;
    name: string;
    sort_order: number;
    product_option_values: { id: string; label: string; sort_order: number }[];
  }[];
}

const CAMPOS_BASE =
  "id,name,slug,price,promo_price,description,materials,size_info,is_new,featured,sold_out,stock,categories(name)";

/** Consulta completa (exige a migração 0005). */
const PRODUCT_SELECT = `${CAMPOS_BASE},in_hero,hero_order,product_images(url,alt,sort_order,focal_x,focal_y),product_options(id,name,sort_order,product_option_values(id,label,sort_order))`;

/** Consulta sem as colunas da 0005, para o banco ainda não migrado. */
const PRODUCT_SELECT_LEGADO = `${CAMPOS_BASE},product_images(url,alt,sort_order)`;

/**
 * A migração 0005 já rodou? `null` = ainda não sabemos.
 * Sem isso, cada leitura tentaria a consulta nova e falharia de novo.
 */
let temMigracao0005: boolean | null = null;

/**
 * Executa a consulta pedindo as colunas novas e, se o banco ainda não
 * tiver a migração 0005, repete sem elas.
 *
 * O ponto importante: SEM este fallback, o erro subiria para o catch
 * de cada função e o site inteiro cairia no mock silenciosamente —
 * exatamente o bug de cache que já aconteceu aqui antes. Melhor
 * mostrar o catálogo real sem variações do que um catálogo falso.
 */
async function consultarProdutos<T>(
  executar: (select: string) => PromiseLike<{ data: unknown; error: unknown }>,
): Promise<T> {
  if (temMigracao0005 !== false) {
    const r = await executar(PRODUCT_SELECT);
    if (!r.error) {
      temMigracao0005 = true;
      return r.data as T;
    }
    if (temMigracao0005 === true) throw r.error; // migração existe: erro real
  }

  const r = await executar(PRODUCT_SELECT_LEGADO);
  if (r.error) throw r.error;
  if (temMigracao0005 === null) {
    console.warn(
      "[data] migração 0005 ainda não rodou — catálogo sem variações e sem controle do hero.",
    );
  }
  temMigracao0005 = false;
  return r.data as T;
}

function mapProduct(row: ProductRow): Product {
  const images = [...row.product_images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => ({
      src: i.url,
      alt: i.alt || row.name,
      focalX: i.focal_x ?? 50,
      focalY: i.focal_y ?? 50,
    }));

  // Grupo sem nenhum valor cadastrado é ignorado: senão a cliente
  // ficaria travada num seletor vazio, sem conseguir comprar.
  const options = [...(row.product_options ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((o) => ({
      id: o.id,
      name: o.name,
      values: [...(o.product_option_values ?? [])]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((v) => ({ id: v.id, label: v.label })),
    }))
    .filter((o) => o.values.length > 0);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.categories?.name ?? "",
    price: Number(row.price),
    promoPrice: row.promo_price !== null ? Number(row.promo_price) : undefined,
    images:
      images.length > 0
        ? images
        : [
            {
              src: "/placeholders/p1.svg",
              alt: row.name,
              focalX: 50,
              focalY: 50,
            },
          ],
    badge: row.sold_out
      ? "esgotado"
      : row.stock !== null && row.stock > 0 && row.stock <= 3
        ? "ultimas"
        : row.is_new
          ? "novo"
          : undefined,
    featured: row.featured,
    inHero: row.in_hero ?? false,
    heroOrder: row.hero_order ?? 0,
    description: row.description,
    materials: row.materials,
    sizeInfo: row.size_info,
    options,
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!hasSupabase) return mock.products;
  try {
    const supabase = createPublicClient();
    const data = await consultarProdutos<ProductRow[]>((select) =>
      supabase
        .from("products")
        .select(select)
        .eq("active", true)
        .order("created_at", { ascending: false }),
    );
    return (data ?? []).map(mapProduct);
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
    const data = await consultarProdutos<ProductRow | null>((select) =>
      supabase
        .from("products")
        .select(select)
        .eq("active", true)
        .eq("slug", slug)
        .maybeSingle(),
    );
    return data ? mapProduct(data) : undefined;
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
    const data = await consultarProdutos<{
      title: string;
      slug: string;
      image_url: string | null;
      body: string;
      cta_label: string;
      campaign_products: { products: ProductRow | null }[];
    } | null>((select) =>
      supabase
        .from("campaigns")
        .select(
          `title,slug,image_url,body,cta_label,campaign_products(products(${select}))`,
        )
        .eq("active", true)
        .eq("slug", slug)
        .maybeSingle(),
    );
    if (!data) return null;

    const rows = data.campaign_products
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

/**
 * A calculadora de frete aparece quando há como cotar os Correios
 * (token do Melhor Envio + CEP de origem) OU quando a entrega expressa
 * está ativa — assim ela funciona mesmo sem o Melhor Envio.
 */
export async function getFreteDisponivel(): Promise<boolean> {
  if (!hasSupabase) return false;
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "frete")
      .maybeSingle();
    const config = (data?.value ?? {}) as {
      cep_origem?: string;
      expressa?: { ativo?: boolean };
    };
    const podeCotar = !!process.env.MELHOR_ENVIO_TOKEN && !!config.cep_origem;
    return podeCotar || config.expressa?.ativo === true;
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
