"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { uploadImagem } from "@/lib/admin/upload";
import { slugify } from "@/lib/slug";
import type { ProdutoInput } from "./actions";

export interface ImagemForm {
  url: string;
  alt: string;
}

export interface ProdutoFormValues {
  name: string;
  slug: string;
  categoryId: string | null;
  price: string;
  promoPrice: string;
  description: string;
  materials: string;
  sizeInfo: string;
  isNew: boolean;
  featured: boolean;
  soldOut: boolean;
  active: boolean;
  stock: string;
  images: ImagemForm[];
}

interface ProdutoFormProps {
  categorias: { id: string; name: string }[];
  inicial: ProdutoFormValues;
  onSubmit: (input: ProdutoInput) => Promise<{ erro: string } | void>;
  onDelete?: (formData: FormData) => Promise<void>;
  deleteId?: string;
}

export function ProdutoForm({
  categorias,
  inicial,
  onSubmit,
  onDelete,
  deleteId,
}: ProdutoFormProps) {
  const [v, setV] = useState<ProdutoFormValues>(inicial);
  const [slugEditado, setSlugEditado] = useState(!!inicial.slug);
  const [erro, setErro] = useState<string | null>(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [salvando, startSalvar] = useTransition();

  const set = <K extends keyof ProdutoFormValues>(
    key: K,
    value: ProdutoFormValues[K],
  ) => setV((prev) => ({ ...prev, [key]: value }));

  const handleFotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErro(null);
    setEnviandoFoto(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadImagem(file, "products");
        setV((prev) => ({
          ...prev,
          images: [...prev.images, { url, alt: "" }],
        }));
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha no envio da foto.");
    } finally {
      setEnviandoFoto(false);
    }
  };

  const moverFoto = (i: number, dir: -1 | 1) => {
    setV((prev) => {
      const imgs = [...prev.images];
      const j = i + dir;
      if (j < 0 || j >= imgs.length) return prev;
      [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
      return { ...prev, images: imgs };
    });
  };

  const salvar = () => {
    setErro(null);
    if (!v.name.trim()) return setErro("Dê um nome pra peça.");
    if (v.images.length === 0)
      return setErro("Adicione pelo menos uma foto.");

    startSalvar(async () => {
      const resultado = await onSubmit({
        name: v.name,
        slug: v.slug || undefined,
        categoryId: v.categoryId,
        price: v.price === "" ? 0 : Number(v.price.replace(",", ".")),
        promoPrice:
          v.promoPrice === "" ? null : Number(v.promoPrice.replace(",", ".")),
        description: v.description,
        materials: v.materials,
        sizeInfo: v.sizeInfo,
        isNew: v.isNew,
        featured: v.featured,
        soldOut: v.soldOut,
        active: v.active,
        stock: v.stock === "" ? null : Number(v.stock),
        images: v.images,
      });
      if (resultado?.erro) setErro(resultado.erro);
    });
  };

  const campo =
    "mt-1.5 w-full rounded-2xl border border-text/15 bg-white px-4 py-3 outline-none transition-colors focus:border-primary";
  const rotulo = "label-caps block text-earth";

  return (
    <div className="max-w-3xl">
      {erro && (
        <p className="mb-5 rounded-2xl bg-sun/30 px-4 py-3 text-sm">{erro}</p>
      )}

      <div className="space-y-5">
        <div>
          <label className={rotulo} htmlFor="nome">
            Nome da peça
          </label>
          <input
            id="nome"
            value={v.name}
            onChange={(e) => {
              set("name", e.target.value);
              if (!slugEditado) set("slug", slugify(e.target.value));
            }}
            className={campo}
            placeholder="Ex.: Colar Sol de Ipanema"
          />
        </div>

        <div>
          <label className={rotulo} htmlFor="slug">
            Endereço na loja (slug)
          </label>
          <div className="mt-1.5 flex items-center gap-1 rounded-2xl border border-text/15 bg-white px-4 focus-within:border-primary">
            <span className="text-sm text-text/40">/produtos/</span>
            <input
              id="slug"
              value={v.slug}
              onChange={(e) => {
                setSlugEditado(true);
                set("slug", e.target.value);
              }}
              className="w-full bg-transparent py-3 outline-none"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className={rotulo} htmlFor="categoria">
              Categoria
            </label>
            <select
              id="categoria"
              value={v.categoryId ?? ""}
              onChange={(e) => set("categoryId", e.target.value || null)}
              className={campo}
            >
              <option value="">Sem categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={rotulo} htmlFor="preco">
              Preço (R$)
            </label>
            <input
              id="preco"
              inputMode="decimal"
              value={v.price}
              onChange={(e) => set("price", e.target.value)}
              className={campo}
              placeholder="65,00"
            />
          </div>
          <div>
            <label className={rotulo} htmlFor="promo">
              Preço promocional
            </label>
            <input
              id="promo"
              inputMode="decimal"
              value={v.promoPrice}
              onChange={(e) => set("promoPrice", e.target.value)}
              className={campo}
              placeholder="deixe vazio se não tiver"
            />
          </div>
        </div>

        <div>
          <label className={rotulo} htmlFor="descricao">
            Descrição
          </label>
          <textarea
            id="descricao"
            rows={4}
            value={v.description}
            onChange={(e) => set("description", e.target.value)}
            className={campo}
            placeholder="Conte a história dessa peça…"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={rotulo} htmlFor="materiais">
              Materiais e cuidados
            </label>
            <textarea
              id="materiais"
              rows={3}
              value={v.materials}
              onChange={(e) => set("materials", e.target.value)}
              className={campo}
            />
          </div>
          <div>
            <label className={rotulo} htmlFor="tamanho">
              Tamanho e ajuste
            </label>
            <textarea
              id="tamanho"
              rows={3}
              value={v.sizeInfo}
              onChange={(e) => set("sizeInfo", e.target.value)}
              className={campo}
            />
          </div>
        </div>

        {/* Fotos */}
        <div>
          <p className={rotulo}>Fotos (a primeira é a capa)</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {v.images.map((img, i) => (
              <div
                key={img.url}
                className="w-28 overflow-hidden rounded-2xl border border-text/10 bg-white"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={img.url}
                    alt={img.alt || `Foto ${i + 1}`}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold">
                      capa
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between px-1.5 py-1">
                  <button
                    type="button"
                    onClick={() => moverFoto(i, -1)}
                    aria-label="Mover foto para a esquerda"
                    className="rounded p-1 text-text/50 hover:text-text"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setV((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, j) => j !== i),
                      }))
                    }
                    aria-label="Remover foto"
                    className="rounded p-1 text-text/50 hover:text-red-700"
                  >
                    ✕
                  </button>
                  <button
                    type="button"
                    onClick={() => moverFoto(i, 1)}
                    aria-label="Mover foto para a direita"
                    className="rounded p-1 text-text/50 hover:text-text"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}

            <label className="flex aspect-[4/5] w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-text/20 text-text/50 transition-colors hover:border-primary hover:text-primary">
              <span className="text-2xl">+</span>
              <span className="px-2 text-center text-xs">
                {enviandoFoto ? "Enviando…" : "Adicionar foto"}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                disabled={enviandoFoto}
                onChange={(e) => handleFotos(e.target.files)}
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-text/50">
            JPG, PNG ou WebP até 4 MB. Use as setas para mudar a ordem.
          </p>
        </div>

        {/* Flags */}
        <div className="flex flex-wrap gap-x-8 gap-y-3 rounded-3xl bg-bg px-5 py-4">
          {(
            [
              ["active", "À venda no site"],
              ["featured", "Destaque (home e vitrine)"],
              ["isNew", 'Badge "novo"'],
              ["soldOut", "Esgotada"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={v[key]}
                onChange={(e) => set(key, e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              {label}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm">
            Estoque:
            <input
              inputMode="numeric"
              value={v.stock}
              onChange={(e) => set("stock", e.target.value)}
              placeholder="opcional"
              className="w-24 rounded-xl border border-text/15 bg-white px-3 py-1.5 outline-none focus:border-primary"
            />
          </label>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={salvar}
          disabled={salvando || enviandoFoto}
          className="rounded-full bg-primary px-8 py-3.5 font-semibold text-bg-light transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {salvando ? "Salvando…" : "Salvar peça"}
        </button>

        {onDelete && deleteId && (
          <form
            action={onDelete}
            onSubmit={(e) => {
              if (!confirm("Excluir esta peça de vez? Não dá pra desfazer.")) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={deleteId} />
            <button
              type="submit"
              className="link-underline text-sm font-medium text-red-800"
            >
              Excluir peça
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
