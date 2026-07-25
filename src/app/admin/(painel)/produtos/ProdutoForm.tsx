"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { uploadImagem } from "@/lib/admin/upload";
import { slugify } from "@/lib/slug";
import type { ProdutoInput } from "./actions";

export interface ImagemForm {
  url: string;
  alt: string;
  /** ponto da foto que fica visível no corte da tela principal (%) */
  focalX: number;
  focalY: number;
}

/** Grupo de escolha da peça: "Material" → ["Dourado", "Prata"]. */
export interface OpcaoForm {
  name: string;
  values: string[];
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
  inHero: boolean;
  heroOrder: string;
  options: OpcaoForm[];
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
  // Índice da foto que está sendo enquadrada (null = nenhuma).
  const [enquadrando, setEnquadrando] = useState<number | null>(null);
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
          images: [
            ...prev.images,
            { url, alt: "", focalX: 50, focalY: 50 },
          ],
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
        inHero: v.inHero,
        heroOrder: v.heroOrder === "" ? 0 : Number(v.heroOrder),
        // Grupo sem nome ou sem valores é descartado aqui mesmo.
        options: v.options
          .map((o) => ({
            name: o.name.trim(),
            values: o.values.map((s) => s.trim()).filter(Boolean),
          }))
          .filter((o) => o.name !== "" && o.values.length > 0),
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
                <button
                  type="button"
                  onClick={() => setEnquadrando(i)}
                  className="group relative block aspect-[4/5] w-full cursor-pointer"
                  aria-label={`Enquadrar foto ${i + 1}`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `Foto ${i + 1}`}
                    fill
                    sizes="112px"
                    style={{
                      objectPosition: `${img.focalX}% ${img.focalY}%`,
                    }}
                    className="object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold">
                      capa
                    </span>
                  )}
                  {(img.focalX !== 50 || img.focalY !== 50) && (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-bg-light">
                      ✓ enq.
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-text/60 py-0.5 text-center text-[10px] font-semibold text-bg-light opacity-0 transition-opacity group-hover:opacity-100">
                    Enquadrar
                  </span>
                </button>
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
            JPG, PNG ou WebP — pode mandar a foto direto da câmera, ela é
            reduzida sozinha no envio. Use as setas para mudar a ordem e
            clique numa foto para enquadrar.
          </p>
        </div>

        {/* Enquadramento da foto escolhida (vale para catálogo, página e
            tela principal). */}
        {enquadrando !== null && v.images[enquadrando] && (
          <EnquadrarFoto
            imagem={v.images[enquadrando]}
            indice={enquadrando}
            capa={enquadrando === 0}
            onChange={(focalX, focalY) =>
              setV((prev) => ({
                ...prev,
                images: prev.images.map((img, i) =>
                  i === enquadrando ? { ...img, focalX, focalY } : img,
                ),
              }))
            }
            onFechar={() => setEnquadrando(null)}
          />
        )}

        {/* Variações da peça */}
        <Variacoes
          options={v.options}
          onChange={(options) => set("options", options)}
        />

        {/* Flags */}
        <div className="flex flex-wrap gap-x-8 gap-y-3 rounded-3xl bg-bg px-5 py-4">
          {(
            [
              ["active", "À venda no site"],
              ["featured", "Destaque (home e vitrine)"],
              ["inHero", "Aparece na tela principal"],
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
          {v.inHero && (
            <label className="flex items-center gap-2 text-sm">
              Ordem na tela principal:
              <input
                inputMode="numeric"
                value={v.heroOrder}
                onChange={(e) => set("heroOrder", e.target.value)}
                placeholder="0"
                className="w-20 rounded-xl border border-text/15 bg-white px-3 py-1.5 outline-none focus:border-primary"
              />
            </label>
          )}
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

/**
 * Enquadramento de UMA foto: a lojista clica no ponto que precisa
 * aparecer e o mesmo ponto vale onde a foto é cortada — no catálogo,
 * na página da peça e, sendo a capa, na tela principal.
 *
 * Cortar sempre pelo centro (o padrão) faz foto vertical de modelo
 * perder a bijuteria, que fica no colo. As prévias mostram o corte
 * real de cada lugar em tempo real.
 */
function EnquadrarFoto({
  imagem,
  indice,
  capa,
  onChange,
  onFechar,
}: {
  imagem: ImagemForm;
  indice: number;
  capa: boolean;
  onChange: (focalX: number, focalY: number) => void;
  onFechar: () => void;
}) {
  const marcar = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const dentro = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
    onChange(
      dentro(((e.clientX - r.left) / r.width) * 100),
      dentro(((e.clientY - r.top) / r.height) * 100),
    );
  };

  const posicao = `${imagem.focalX}% ${imagem.focalY}%`;

  // Função que devolve JSX (não é componente): evita remontar e resetar
  // estado a cada render, e é o bastante para as duas prévias.
  const previa = (titulo: string, className: string) => (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-text/60">{titulo}</p>
      <div
        className={`relative overflow-hidden rounded-2xl border border-text/15 bg-earth ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagem.url}
          alt={`Prévia — ${titulo}`}
          className="h-full w-full object-cover"
          style={{ objectPosition: posicao }}
        />
      </div>
    </div>
  );

  return (
    <div className="rounded-3xl bg-bg px-5 py-4">
      <div className="flex items-center justify-between">
        <p className="label-caps text-earth">
          Enquadrar a foto {indice + 1}
        </p>
        <button
          type="button"
          onClick={onFechar}
          className="rounded-full px-3 py-1 text-sm font-semibold text-text/60 hover:text-text"
        >
          Fechar
        </button>
      </div>
      <p className="mt-1 text-xs text-text/60">
        Clique no ponto que precisa aparecer — normalmente a peça, não o
        rosto. As prévias mostram o corte real.
      </p>

      <div className="mt-3 flex flex-wrap items-start gap-4">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-text/60">
            Foto inteira (clique aqui)
          </p>
          {/*
            <img> puro de propósito: o elemento precisa ter exatamente o
            tamanho da imagem renderizada para o clique virar coordenada
            correta. Com next/image e proporção fixa sobraria borda e o
            ponto sairia deslocado. É tela de admin, sem ganho em otimizar.
          */}
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagem.url}
              alt="Escolha o ponto que deve aparecer"
              onClick={marcar}
              className="block max-h-64 w-auto max-w-70 cursor-crosshair rounded-2xl border border-text/15"
            />
            {/* Marcador do ponto escolhido */}
            <span
              aria-hidden
              className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary/80 shadow"
              style={{ left: `${imagem.focalX}%`, top: `${imagem.focalY}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-text/50">
            Ponto: {imagem.focalX}% / {imagem.focalY}%
          </p>
          <button
            type="button"
            onClick={() => onChange(50, 50)}
            className="mt-1 text-xs font-semibold text-primary underline underline-offset-2"
          >
            Centralizar de novo
          </button>
        </div>

        {previa("No catálogo", "h-64 w-52")}
        {capa && previa("Na tela principal", "h-40 w-64")}
      </div>
    </div>
  );
}

/**
 * Grupos de escolha da peça ("Material", "Cor da cordinha").
 * A cliente escolhe um valor de cada grupo antes de pôr no carrinho;
 * a escolha vai junto na mensagem do WhatsApp. Preço e estoque
 * continuam sendo do produto.
 */
function Variacoes({
  options,
  onChange,
}: {
  options: OpcaoForm[];
  onChange: (options: OpcaoForm[]) => void;
}) {
  // Enquanto ela digita "Dourado, " o texto cru fica aqui, senão a
  // vírgula sumiria a cada tecla.
  const [rascunho, setRascunho] = useState<Record<number, string>>({});

  const alterar = (i: number, mudanca: Partial<OpcaoForm>) =>
    onChange(options.map((o, j) => (j === i ? { ...o, ...mudanca } : o)));

  const digitarValores = (i: number, texto: string) => {
    setRascunho((r) => ({ ...r, [i]: texto }));
    alterar(i, {
      values: texto
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className="rounded-3xl bg-bg px-5 py-4">
      <p className="label-caps text-earth">Variações da peça</p>
      <p className="mt-1 text-xs text-text/60">
        Para peças em que a cliente escolhe, por exemplo, o material e a cor da
        cordinha. Deixe vazio se a peça não tem escolha.
      </p>

      <div className="mt-3 space-y-3">
        {options.map((o, i) => (
          <div
            key={i}
            className="rounded-2xl border border-text/10 bg-white p-3"
          >
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-xs font-semibold text-text/60">
                Tipo de escolha
                <input
                  value={o.name}
                  onChange={(e) => alterar(i, { name: e.target.value })}
                  placeholder="Material"
                  className="mt-1 block w-44 rounded-xl border border-text/15 px-3 py-1.5 text-sm font-normal text-text outline-none focus:border-primary"
                />
              </label>
              <label className="flex-1 text-xs font-semibold text-text/60">
                Opções (separe por vírgula)
                <input
                  value={rascunho[i] ?? o.values.join(", ")}
                  onChange={(e) => digitarValores(i, e.target.value)}
                  placeholder="Dourado, Prata"
                  className="mt-1 block w-full min-w-52 rounded-xl border border-text/15 px-3 py-1.5 text-sm font-normal text-text outline-none focus:border-primary"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setRascunho({});
                  onChange(options.filter((_, j) => j !== i));
                }}
                className="rounded-xl px-3 py-1.5 text-sm text-text/50 transition-colors hover:text-red-700"
              >
                Remover
              </button>
            </div>

            {o.values.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {o.values.map((valor) => (
                  <span
                    key={valor}
                    className="rounded-full bg-bg px-2.5 py-1 text-xs"
                  >
                    {valor}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {options.length < 5 && (
        <button
          type="button"
          onClick={() => onChange([...options, { name: "", values: [] }])}
          className="mt-3 rounded-full border border-text/15 px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
        >
          + Adicionar tipo de escolha
        </button>
      )}
    </div>
  );
}
