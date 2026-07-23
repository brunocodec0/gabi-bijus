import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { formatBRL } from "@/lib/format";
import { CupomAdminForm } from "./CupomAdminForm";
import { alternarCupom, excluirCupom } from "./actions";

export const metadata: Metadata = { title: "Cupons" };

interface CupomRow {
  id: string;
  code: string;
  kind: "percent" | "fixed";
  value: number;
  min_subtotal: number | null;
  ends_at: string | null;
  active: boolean;
}

export default async function AdminCupons() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("coupons")
    .select("id,code,kind,value,min_subtotal,ends_at,active")
    .order("created_at", { ascending: false });

  const cupons = (data ?? []) as CupomRow[];

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-medium">Cupons</h1>
      <p className="mt-2 text-sm text-text/60">
        A cliente digita o código no carrinho e o desconto entra na hora.
      </p>

      {error && (
        <p className="mt-4 rounded-2xl bg-sun/30 px-4 py-3 text-sm">
          Não consegui carregar os cupons — a migração{" "}
          <code>0003_cupons.sql</code> já foi aplicada no Supabase?
        </p>
      )}

      <div className="mt-6">
        <CupomAdminForm />
      </div>

      {cupons.length > 0 && (
        <ul className="mt-6 space-y-3">
          {cupons.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-3xl border border-text/10 bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-mono font-semibold tracking-wide">
                  {c.code}
                </p>
                <p className="text-sm text-text/60">
                  {c.kind === "percent"
                    ? `${Number(c.value)}% de desconto`
                    : `${formatBRL(Number(c.value))} de desconto`}
                  {c.min_subtotal !== null &&
                    ` · pedidos a partir de ${formatBRL(Number(c.min_subtotal))}`}
                  {c.ends_at &&
                    ` · até ${new Date(c.ends_at).toLocaleDateString("pt-BR")}`}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  c.active
                    ? "bg-primary text-bg-light"
                    : "bg-text/10 text-text/60"
                }`}
              >
                {c.active ? "ativo" : "pausado"}
              </span>

              <form action={alternarCupom}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="ativo" value={String(c.active)} />
                <button
                  type="submit"
                  className="link-underline text-sm font-medium text-primary"
                >
                  {c.active ? "Pausar" : "Ativar"}
                </button>
              </form>

              <form action={excluirCupom}>
                <input type="hidden" name="id" value={c.id} />
                <button
                  type="submit"
                  aria-label={`Excluir cupom ${c.code}`}
                  className="rounded-full p-2 text-text/40 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  ✕
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
