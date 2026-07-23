import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { ProdutoForm } from "../ProdutoForm";
import { criarProduto } from "../actions";

export const metadata: Metadata = { title: "Nova peça" };

export default async function NovoProduto() {
  const { supabase } = await requireAdmin();
  const { data: categorias } = await supabase
    .from("categories")
    .select("id,name")
    .order("sort_order");

  return (
    <div>
      <p className="label-caps text-earth">Produtos</p>
      <h1 className="mt-1 text-3xl font-medium">Nova peça ✨</h1>
      <div className="mt-7">
        <ProdutoForm
          categorias={categorias ?? []}
          inicial={{
            name: "",
            slug: "",
            categoryId: null,
            price: "",
            promoPrice: "",
            description: "",
            materials: "",
            sizeInfo: "",
            isNew: true,
            featured: false,
            soldOut: false,
            active: true,
            stock: "",
            images: [],
          }}
          onSubmit={criarProduto}
        />
      </div>
    </div>
  );
}
