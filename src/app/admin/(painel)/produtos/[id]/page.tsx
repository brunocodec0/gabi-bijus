import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { ProdutoForm } from "../ProdutoForm";
import { atualizarProduto, excluirProduto } from "../actions";

export const metadata: Metadata = { title: "Editar peça" };

export default async function EditarProduto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id } = await params;

  const CAMPOS =
    "id,name,slug,category_id,price,promo_price,description,materials,size_info,is_new,featured,sold_out,active,stock";
  const COMPLETO = `${CAMPOS},in_hero,hero_order,product_images(url,alt,sort_order,focal_x,focal_y),product_options(id,name,sort_order,product_option_values(id,label,sort_order))`;
  const LEGADO = `${CAMPOS},product_images(url,alt,sort_order)`;

  const [completo, { data: categorias }] = await Promise.all([
    supabase.from("products").select(COMPLETO).eq("id", id).maybeSingle(),
    supabase.from("categories").select("id,name").order("sort_order"),
  ]);

  // Sem a migração 0005 as colunas novas não existem: reconsulta sem
  // elas para a lojista continuar conseguindo editar a peça.
  const { data: produto } = completo.error
    ? await supabase.from("products").select(LEGADO).eq("id", id).maybeSingle()
    : completo;

  if (!produto) notFound();

  interface LinhaFoto {
    url: string;
    alt: string;
    sort_order: number;
    focal_x?: number;
    focal_y?: number;
  }
  interface LinhaOpcao {
    name: string;
    sort_order: number;
    product_option_values: { label: string; sort_order: number }[];
  }
  const p = produto as typeof produto & {
    in_hero?: boolean;
    hero_order?: number;
    product_images: LinhaFoto[];
    product_options?: LinhaOpcao[];
  };

  const atualizarComId = atualizarProduto.bind(null, produto.id);

  return (
    <div>
      <p className="label-caps text-earth">Produtos</p>
      <h1 className="mt-1 text-3xl font-medium">{produto.name}</h1>
      <div className="mt-7">
        <ProdutoForm
          categorias={categorias ?? []}
          inicial={{
            name: produto.name,
            slug: produto.slug,
            categoryId: produto.category_id,
            price: String(produto.price),
            promoPrice:
              produto.promo_price !== null ? String(produto.promo_price) : "",
            description: produto.description,
            materials: produto.materials,
            sizeInfo: produto.size_info,
            isNew: produto.is_new,
            featured: produto.featured,
            soldOut: produto.sold_out,
            active: produto.active,
            stock: produto.stock !== null ? String(produto.stock) : "",
            images: [...p.product_images]
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((i) => ({
                url: i.url,
                alt: i.alt,
                focalX: i.focal_x ?? 50,
                focalY: i.focal_y ?? 50,
              })),
            inHero: p.in_hero ?? false,
            heroOrder: String(p.hero_order ?? 0),
            options: [...(p.product_options ?? [])]
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((o) => ({
                name: o.name,
                values: [...(o.product_option_values ?? [])]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((val) => val.label),
              })),
          }}
          onSubmit={atualizarComId}
          onDelete={excluirProduto}
          deleteId={produto.id}
        />
      </div>
    </div>
  );
}
