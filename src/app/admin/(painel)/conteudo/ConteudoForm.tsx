"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { uploadImagem } from "@/lib/admin/upload";
import { salvarConteudo, type ConteudoInput } from "./actions";

interface ConteudoFormProps {
  inicial: {
    heroTagline: string;
    heroHighlight: string;
    heroSubtitle: string;
    marqueeWords: string[];
    aboutTitle: string;
    aboutText: string;
    instagramHandle: string;
    instagramUrl: string;
    instagramImages: { src: string; alt: string }[];
    whatsapp: string;
    footerNote: string;
    careNote: string;
    politicaTrocas: string;
  };
}

export function ConteudoForm({ inicial }: ConteudoFormProps) {
  const [v, setV] = useState(inicial);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(
    null,
  );
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [salvando, startSalvar] = useTransition();

  const campo =
    "mt-1.5 w-full rounded-2xl border border-text/15 bg-white px-4 py-3 outline-none transition-colors focus:border-primary";
  const rotulo = "label-caps block text-earth";
  const secao = "rounded-3xl border border-text/10 bg-white p-6";

  const salvar = () => {
    setMsg(null);
    const input: ConteudoInput = {
      hero: {
        tagline: v.heroTagline,
        highlight: v.heroHighlight,
        subtitle: v.heroSubtitle,
      },
      marquee: { words: v.marqueeWords.filter((w) => w.trim() !== "") },
      sobre: { title: v.aboutTitle, text: v.aboutText },
      instagram: {
        handle: v.instagramHandle,
        url: v.instagramUrl,
        images: v.instagramImages,
      },
      contato: { whatsapp: v.whatsapp.trim() === "" ? null : v.whatsapp.trim() },
      rodape: { nota: v.footerNote, cuidados: v.careNote },
      politica: { trocas: v.politicaTrocas },
    };
    startSalvar(async () => {
      const resultado = await salvarConteudo(input);
      setMsg(
        "erro" in resultado && resultado.erro
          ? { tipo: "erro", texto: resultado.erro }
          : { tipo: "ok", texto: "Salvo! O site já está atualizado. ✨" },
      );
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      {msg && (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            msg.tipo === "ok" ? "bg-primary/10 text-primary" : "bg-sun/30"
          }`}
        >
          {msg.texto}
        </p>
      )}

      <section className={secao}>
        <h2 className="font-display text-xl font-medium">Abertura (hero)</h2>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <div>
              <label className={rotulo}>Frase principal</label>
              <input
                value={v.heroTagline}
                onChange={(e) =>
                  setV((p) => ({ ...p, heroTagline: e.target.value }))
                }
                className={campo}
              />
            </div>
            <div>
              <label className={rotulo}>Palavra em destaque</label>
              <input
                value={v.heroHighlight}
                onChange={(e) =>
                  setV((p) => ({ ...p, heroHighlight: e.target.value }))
                }
                className={campo}
              />
            </div>
          </div>
          <div>
            <label className={rotulo}>Subtítulo</label>
            <textarea
              rows={2}
              value={v.heroSubtitle}
              onChange={(e) =>
                setV((p) => ({ ...p, heroSubtitle: e.target.value }))
              }
              className={campo}
            />
          </div>
        </div>
      </section>

      <section className={secao}>
        <h2 className="font-display text-xl font-medium">
          Palavras do letreiro (marquee)
        </h2>
        <p className="mt-1 text-sm text-text/60">Uma por linha.</p>
        <textarea
          rows={4}
          value={v.marqueeWords.join("\n")}
          onChange={(e) =>
            setV((p) => ({ ...p, marqueeWords: e.target.value.split("\n") }))
          }
          className={campo}
        />
      </section>

      <section className={secao}>
        <h2 className="font-display text-xl font-medium">Sobre a marca</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className={rotulo}>Título</label>
            <input
              value={v.aboutTitle}
              onChange={(e) =>
                setV((p) => ({ ...p, aboutTitle: e.target.value }))
              }
              className={campo}
            />
          </div>
          <div>
            <label className={rotulo}>Manifesto</label>
            <textarea
              rows={5}
              value={v.aboutText}
              onChange={(e) =>
                setV((p) => ({ ...p, aboutText: e.target.value }))
              }
              className={campo}
            />
          </div>
        </div>
      </section>

      <section className={secao}>
        <h2 className="font-display text-xl font-medium">Instagram</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={rotulo}>@ do perfil</label>
            <input
              value={v.instagramHandle}
              onChange={(e) =>
                setV((p) => ({ ...p, instagramHandle: e.target.value }))
              }
              className={campo}
            />
          </div>
          <div>
            <label className={rotulo}>Link do perfil</label>
            <input
              value={v.instagramUrl}
              onChange={(e) =>
                setV((p) => ({ ...p, instagramUrl: e.target.value }))
              }
              className={campo}
            />
          </div>
        </div>

        <p className={`${rotulo} mt-5`}>Fotos do grid da home</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {v.instagramImages.map((img, i) => (
            <div key={img.src + i} className="relative">
              <span className="relative block h-20 w-20 overflow-hidden rounded-xl bg-bg">
                <Image
                  src={img.src}
                  alt={img.alt || `Foto ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </span>
              <button
                type="button"
                aria-label="Remover foto"
                onClick={() =>
                  setV((p) => ({
                    ...p,
                    instagramImages: p.instagramImages.filter(
                      (_, j) => j !== i,
                    ),
                  }))
                }
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-text text-[10px] text-bg-light"
              >
                ✕
              </button>
            </div>
          ))}
          <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-text/20 text-xl text-text/50 transition-colors hover:border-primary hover:text-primary">
            {enviandoFoto ? "…" : "+"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              disabled={enviandoFoto}
              onChange={async (e) => {
                const files = e.target.files;
                if (!files) return;
                setMsg(null);
                setEnviandoFoto(true);
                try {
                  for (const file of Array.from(files)) {
                    const url = await uploadImagem(file, "content");
                    setV((p) => ({
                      ...p,
                      instagramImages: [
                        ...p.instagramImages,
                        { src: url, alt: "" },
                      ],
                    }));
                  }
                } catch (err) {
                  setMsg({
                    tipo: "erro",
                    texto:
                      err instanceof Error ? err.message : "Falha no envio.",
                  });
                } finally {
                  setEnviandoFoto(false);
                }
              }}
            />
          </label>
        </div>
      </section>

      <section className={secao}>
        <h2 className="font-display text-xl font-medium">
          WhatsApp e rodapé
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className={rotulo}>
              Número do WhatsApp (com DDI, só dígitos — ex.: 5521999999999)
            </label>
            <input
              value={v.whatsapp}
              inputMode="numeric"
              placeholder="deixe vazio enquanto não tiver"
              onChange={(e) =>
                setV((p) => ({ ...p, whatsapp: e.target.value }))
              }
              className={campo}
            />
          </div>
          <div>
            <label className={rotulo}>Nota do carrinho/rodapé</label>
            <input
              value={v.footerNote}
              onChange={(e) =>
                setV((p) => ({ ...p, footerNote: e.target.value }))
              }
              className={campo}
            />
          </div>
          <div>
            <label className={rotulo}>Cuidados com as peças (resumo)</label>
            <textarea
              rows={2}
              value={v.careNote}
              onChange={(e) => setV((p) => ({ ...p, careNote: e.target.value }))}
              className={campo}
            />
          </div>
          <div>
            <label className={rotulo}>Política de trocas</label>
            <textarea
              rows={3}
              value={v.politicaTrocas}
              onChange={(e) =>
                setV((p) => ({ ...p, politicaTrocas: e.target.value }))
              }
              className={campo}
            />
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={salvar}
        disabled={salvando || enviandoFoto}
        className="rounded-full bg-primary px-8 py-3.5 font-semibold text-bg-light transition-colors hover:bg-primary-dark disabled:opacity-50"
      >
        {salvando ? "Salvando…" : "Salvar tudo"}
      </button>
    </div>
  );
}
