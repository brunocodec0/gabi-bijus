import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { CampanhaForm } from "../CampanhaForm";
import { criarCampanha } from "../actions";

export const metadata: Metadata = { title: "Nova campanha" };

export default async function NovaCampanha() {
  const { supabase } = await requireAdmin();
  const { data: produtos } = await supabase
    .from("products")
    .select("id,name")
    .order("name");

  return (
    <div>
      <p className="label-caps text-earth">Campanhas</p>
      <h1 className="mt-1 text-3xl font-medium">Nova campanha 🌞</h1>
      <div className="mt-7">
        <CampanhaForm
          produtos={produtos ?? []}
          inicial={{
            title: "",
            slug: "",
            imageUrl: "",
            body: "",
            ctaLabel: "Ver a coleção",
            startsAt: "",
            endsAt: "",
            active: false,
            productIds: [],
          }}
          onSubmit={criarCampanha}
        />
      </div>
    </div>
  );
}
