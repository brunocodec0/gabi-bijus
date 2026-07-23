import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { CampanhaForm } from "../CampanhaForm";
import { atualizarCampanha, excluirCampanha } from "../actions";

export const metadata: Metadata = { title: "Editar campanha" };

export default async function EditarCampanha({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id } = await params;

  const [{ data: campanha }, { data: produtos }] = await Promise.all([
    supabase
      .from("campaigns")
      .select(
        "id,title,slug,image_url,body,cta_label,starts_at,ends_at,active,campaign_products(product_id)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("products").select("id,name").order("name"),
  ]);

  if (!campanha) notFound();

  const atualizarComId = atualizarCampanha.bind(null, campanha.id);

  return (
    <div>
      <p className="label-caps text-earth">Campanhas</p>
      <h1 className="mt-1 text-3xl font-medium">{campanha.title}</h1>
      <div className="mt-7">
        <CampanhaForm
          produtos={produtos ?? []}
          inicial={{
            title: campanha.title,
            slug: campanha.slug,
            imageUrl: campanha.image_url ?? "",
            body: campanha.body,
            ctaLabel: campanha.cta_label,
            startsAt: campanha.starts_at?.slice(0, 10) ?? "",
            endsAt: campanha.ends_at?.slice(0, 10) ?? "",
            active: campanha.active,
            productIds: campanha.campaign_products.map(
              (cp: { product_id: string }) => cp.product_id,
            ),
          }}
          onSubmit={atualizarComId}
          onDelete={excluirCampanha}
          deleteId={campanha.id}
        />
      </div>
    </div>
  );
}
