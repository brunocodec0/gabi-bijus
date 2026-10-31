"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { uploadImagem } from "@/lib/admin/upload";
import { slugify } from "@/lib/slug";
import type { CampanhaInput } from "./actions";

export interface CampanhaFormValues {
  title: string;
  slug: string;
  imageUrl: string;
  body: string;
  ctaLabel: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  productIds: string[];
}

interface CampanhaFormProps {
  produtos: { id: string; name: string }[];
  inicial: CampanhaFormValues;
  onSubmit: (input: CampanhaInput) => Promise<{ erro: string } | void>;
  onDelete?: (formData: FormData) => Promise<void>;
  onLancar?: (formData: FormData) => Promise<void>;
  deleteId?: string;
  lancada?: boolean;
}

export function CampanhaForm({
  produtos,
  inicial,
  onSubmit,
  onDelete,
  onLancar,
  deleteId,
  lancada,
}: CampanhaFormProps) {
  const [v, setV] = useState(inicial);
  const [slugEditado, setSlugEditado] = useState(!!inicial.slug);
  const [erro, setErro] = useState<string | null>(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [salvando, startSalvar] = useTransition();

  const campo =
    "mt-1.5 w-full rounded-2xl border border-text/15 bg-white px-4 py-3 outline-none transition-colors focus:border-primary";
  const rotulo = "label-caps block text-earth";

  const salvar = () => {
    setErro(null);
    if (!v.title.trim()) return setErro("Dê um título pra campanha.");
    startSalvar(async () => {
      const resultado = await onSubmit({
        title: v.title,
        slug: v.slug || undefined,
        imageUrl: v.imageUrl,
        body: v.body,
        ctaLabel: v.ctaLabel || "Ver a coleção",
        startsAt: v.startsAt,
        endsAt: v.endsAt,
        active: v.active,
        productIds: v.productIds,
      });
      if (resultado?.erro) setErro(resultado.erro);
    });
  };

  return (
    <div className="max-w-3xl">
      {erro && (
        <p className="mb-5 rounded-2xl bg-sun/30 px-4 py-3 text-sm">{erro}</p>
      )}

      <div className="space-y-5">
        <div>
          <label className={rotulo} htmlFor="titulo">
            Título
          </label>
          <input
            id="titulo"
            value={v.title}
            onChange={(e) => {
              setV((p) => ({
                ...p,
                title: e.target.value,
                slug: slugEditado ? p.slug : slugify(e.target.value),
              }));
            }}
            className={campo}
            placeholder="Ex.: Edição Verão no Arpoador"
          />
        </div>

        <div>
          <label className={rotulo} htmlFor="cslug">
            Endereço (slug)
          </label>
          <div className="mt-1.5 flex items-center gap-1 rounded-2xl border border-text/15 bg-white px-4 focus-within:border-primary">
            <span className="text-sm text-text/40">/campanha/</span>
            <input
              id="cslug"
              value={v.slug}
              onChange={(e) => {
                setSlugEditado(true);
                setV((p) => ({ ...p, slug: e.target.value }));
              }}
              className="w-full bg-transparent py-3 outline-none"
            />
          </div>
        </div>

        <div>
          <label className={rotulo} htmlFor="ctexto">
            Texto
          </label>
          <textarea
            id="ctexto"
            rows={3}
            value={v.body}
            onChange={(e) => setV((p) => ({ ...p, body: e.target.value }))}
            className={campo}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className={rotulo} htmlFor="ccta">
              Texto do botão
            </label>
            <input
              id="ccta"
              value={v.ctaLabel}
              onChange={(e) =>
                setV((p) => ({ ...p, ctaLabel: e.target.value }))
              }
              className={campo}
            />
          </div>
          <div>
            <label className={rotulo} htmlFor="cinicio">
              Começa em
            </label>
            <input
              id="cinicio"
              type="date"
              value={v.startsAt}
              onChange={(e) =>
                setV((p) => ({ ...p, startsAt: e.target.value }))
              }
              className={campo}
            />
          </div>
          <div>
            <label className={rotulo} htmlFor="cfim">
              Termina em
            </label>
            <input
              id="cfim"
              type="date"
              value={v.endsAt}
              onChange={(e) => setV((p) => ({ ...p, endsAt: e.target.value }))}
              className={campo}
            />
          </div>
        </div>

        {/* Imagem de capa */}
        <div>
          <p className={rotulo}>Imagem de capa</p>
          <div className="mt-2 flex items-center gap-4">
            {v.imageUrl && (
              <span className="relative block h-28 w-40 overflow-hidden rounded-2xl bg-bg">
                <Image
                  src={v.imageUrl}
                  alt="Capa da campanha"
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </span>
            )}
            <label className="cursor-pointer rounded-full border-2 border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-bg-light">
              {enviandoFoto
                ? "Enviando…"
                : v.imageUrl
                  ? "Trocar imagem"
                  : "Enviar imagem"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={enviandoFoto}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setErro(null);
                  setEnviandoFoto(true);
                  try {
                    const url = await uploadImagem(file, "campaigns");
                    setV((p) => ({ ...p, imageUrl: url }));
                  } catch (err) {
                    setErro(
                      err instanceof Error ? err.message : "Falha no envio.",
                    );
                  } finally {
                    setEnviandoFoto(false);
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* Produtos vinculados */}
        <div>
          <p className={rotulo}>Peças da campanha</p>
          <div className="mt-2 grid gap-2 rounded-3xl bg-bg p-4 sm:grid-cols-2">
            {produtos.map((prod) => (
              <label
                key={prod.id}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={v.productIds.includes(prod.id)}
                  onChange={(e) =>
                    setV((p) => ({
                      ...p,
                      productIds: e.target.checked
                        ? [...p.productIds, prod.id]
                        : p.productIds.filter((x) => x !== prod.id),
                    }))
                  }
                  className="h-4 w-4 accent-primary"
                />
                {prod.name}
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={v.active}
            onChange={(e) => setV((p) => ({ ...p, active: e.target.checked }))}
            className="h-4 w-4 accent-primary"
          />
          Campanha ativa (aparece na home)
        </label>
      </div>

      {lancada && (
        <p className="mt-6 rounded-2xl bg-green-100 px-4 py-3 text-sm text-green-800">
          Coleção lançada! Todos os produtos estão à venda no site.
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={salvar}
          disabled={salvando || enviandoFoto}
          className="rounded-full bg-primary px-8 py-3.5 font-semibold text-bg-light transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {salvando ? "Salvando…" : "Salvar campanha"}
        </button>

        {onLancar && deleteId && !v.active && (
          <form
            action={onLancar}
            onSubmit={(e) => {
              if (
                !confirm(
                  "Lançar coleção agora? A campanha vai ficar ativa e todos os produtos vinculados vão aparecer no site.",
                )
              )
                e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={deleteId} />
            <button
              type="submit"
              className="rounded-full border-2 border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-bg-light"
            >
              Lançar coleção ✦
            </button>
          </form>
        )}

        {onDelete && deleteId && (
          <form
            action={onDelete}
            onSubmit={(e) => {
              if (!confirm("Excluir esta campanha?")) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={deleteId} />
            <button
              type="submit"
              className="link-underline text-sm font-medium text-red-800"
            >
              Excluir campanha
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
