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

  const [{ data: produto }, { data: categorias }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id,name,slug,category_id,price,promo_price,description,materials,size_info,is_new,featured,sold_out,active,stock,product_images(url,alt,sort_order)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("id,name").order("sort_order"),
  ]);

  if (!produto) notFound();

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
            images: [...produto.product_images]
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((i) => ({ url: i.url, alt: i.alt })),
          }}
          onSubmit={atualizarComId}
          onDelete={excluirProduto}
          deleteId={produto.id}
        />
      </div>
    </div>
  );
}
