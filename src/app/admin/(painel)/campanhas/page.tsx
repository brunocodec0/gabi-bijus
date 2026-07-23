import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Campanhas" };

export default async function AdminCampanhas({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string; excluido?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { salvo, excluido } = await searchParams;

  const { data: campanhas } = await supabase
    .from("campaigns")
    .select("id,title,slug,active,campaign_products(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-medium">Campanhas</h1>
        <Link
          href="/admin/campanhas/nova"
          className="rounded-full bg-primary px-6 py-3 font-semibold text-bg-light transition-colors hover:bg-primary-dark"
        >
          + Nova campanha
        </Link>
      </div>

      {salvo && (
        <p className="mt-4 rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary">
          Campanha salva! ✨
        </p>
      )}
      {excluido && (
        <p className="mt-4 rounded-2xl bg-sun/30 px-4 py-3 text-sm">
          Campanha excluída.
        </p>
      )}

      {(campanhas ?? []).length === 0 ? (
        <p className="mt-10 font-display text-xl italic text-text/50">
          nenhuma campanha ainda — crie a primeira!
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {(campanhas ?? []).map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/campanhas/${c.id}`}
                className="flex items-center justify-between gap-4 rounded-3xl border border-text/10 bg-white p-4 transition-colors hover:border-primary"
              >
                <span>
                  <span className="block font-display font-medium">
                    {c.title}
                  </span>
                  <span className="text-sm text-text/50">
                    /campanha/{c.slug} ·{" "}
                    {(c.campaign_products as unknown as { count: number }[])[0]
                      ?.count ?? 0}{" "}
                    peças
                  </span>
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    c.active
                      ? "bg-primary text-bg-light"
                      : "bg-text/10 text-text/60"
                  }`}
                >
                  {c.active ? "ativa" : "inativa"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
