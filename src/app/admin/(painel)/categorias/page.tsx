import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import {
  criarCategoria,
  excluirCategoria,
  moverCategoria,
  renomearCategoria,
} from "./actions";

export const metadata: Metadata = { title: "Categorias" };

export default async function AdminCategorias() {
  const { supabase } = await requireAdmin();
  const { data: categorias } = await supabase
    .from("categories")
    .select("id,name,slug,products(count)")
    .order("sort_order");

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-medium">Categorias</h1>
      <p className="mt-2 text-sm text-text/60">
        A ordem aqui é a ordem dos filtros no catálogo.
      </p>

      <ul className="mt-6 space-y-3">
        {(categorias ?? []).map((c, i, arr) => (
          <li
            key={c.id}
            className="flex flex-wrap items-center gap-3 rounded-3xl border border-text/10 bg-white p-3"
          >
            <div className="flex gap-1">
              <form action={moverCategoria}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="dir" value="cima" />
                <button
                  type="submit"
                  disabled={i === 0}
                  aria-label={`Subir ${c.name}`}
                  className="rounded-full p-2 text-text/50 transition-colors hover:bg-text/5 hover:text-text disabled:opacity-25"
                >
                  ↑
                </button>
              </form>
              <form action={moverCategoria}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="dir" value="baixo" />
                <button
                  type="submit"
                  disabled={i === arr.length - 1}
                  aria-label={`Descer ${c.name}`}
                  className="rounded-full p-2 text-text/50 transition-colors hover:bg-text/5 hover:text-text disabled:opacity-25"
                >
                  ↓
                </button>
              </form>
            </div>

            <form
              action={renomearCategoria}
              className="flex min-w-0 flex-1 items-center gap-2"
            >
              <input type="hidden" name="id" value={c.id} />
              <input
                name="name"
                defaultValue={c.name}
                className="w-full min-w-0 rounded-xl border border-transparent bg-transparent px-3 py-2 font-medium outline-none transition-colors focus:border-primary focus:bg-white"
              />
              <button
                type="submit"
                className="link-underline shrink-0 text-sm font-medium text-primary"
              >
                Renomear
              </button>
            </form>

            <span className="shrink-0 text-xs text-text/40">
              {(c.products as unknown as { count: number }[])[0]?.count ?? 0}{" "}
              peças
            </span>

            <form action={excluirCategoria}>
              <input type="hidden" name="id" value={c.id} />
              <button
                type="submit"
                aria-label={`Excluir ${c.name}`}
                className="rounded-full p-2 text-text/40 transition-colors hover:bg-red-50 hover:text-red-700"
              >
                ✕
              </button>
            </form>
          </li>
        ))}
      </ul>

      <form
        action={criarCategoria}
        className="mt-6 flex items-center gap-3 rounded-3xl border-2 border-dashed border-text/15 p-3"
      >
        <input
          name="name"
          required
          minLength={2}
          placeholder="Nova categoria…"
          className="w-full rounded-xl bg-transparent px-3 py-2 outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-bg-light transition-colors hover:bg-primary-dark"
        >
          Adicionar
        </button>
      </form>

      <p className="mt-4 text-xs text-text/50">
        Ao excluir uma categoria, as peças dela não somem — ficam &quot;sem
        categoria&quot;.
      </p>
    </div>
  );
}
