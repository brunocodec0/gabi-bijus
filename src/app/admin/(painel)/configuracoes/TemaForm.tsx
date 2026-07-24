"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { salvarTema } from "./actions";
import {
  avisosDeContraste,
  corDaMarcaSobre,
  CORES_DO_TEMA,
  ehTemaPadrao,
  HEX_RE,
  PRESETS,
  TEMA_PADRAO,
  textoLegivelSobre,
  type Tema,
} from "@/lib/tema";

type Msg = { tipo: "ok" | "erro"; texto: string } | null;

/**
 * Editor das cores do site (Configurações → Cores do site).
 *
 * O estado `cores` é a fonte da verdade; os <input type="color">
 * carregam os mesmos `name`s esperados pela action salvarTema.
 * Enquanto a lojista digita um código hexadecimal incompleto, o
 * valor fica em `rascunho` para não brigar com o que ela está
 * escrevendo — só vira cor de verdade quando o código fica válido.
 */
export function TemaForm({ inicial }: { inicial: Tema }) {
  const [cores, setCores] = useState<Tema>(inicial);
  const [rascunho, setRascunho] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<Msg>(null);
  const [pending, start] = useTransition();

  const avisos = avisosDeContraste(cores);
  const naOriginal = ehTemaPadrao(cores);

  function escolherCor(id: string, valor: string) {
    setCores((c) => ({ ...c, [id]: valor.toLowerCase() }));
  }

  function digitarHex(id: string, valor: string) {
    const v = "#" + valor.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
    setRascunho((r) => ({ ...r, [id]: v }));
    if (HEX_RE.test(v)) escolherCor(id, v);
  }

  function limparRascunho(id: string) {
    setRascunho((r) => {
      const novo = { ...r };
      delete novo[id];
      return novo;
    });
  }

  function aplicar(tema: Tema) {
    setCores({ ...tema });
    setRascunho({});
    setMsg(null);
  }

  return (
    <form
      action={(fd) =>
        start(async () => {
          const r = await salvarTema(fd);
          setMsg(
            "erro" in r && r.erro
              ? { tipo: "erro", texto: r.erro }
              : { tipo: "ok", texto: "Cores salvas! O site já está com elas." },
          );
        })
      }
      className="space-y-6"
    >
      {msg && (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            msg.tipo === "ok" ? "bg-primary/10 text-primary" : "bg-sun/30"
          }`}
        >
          {msg.texto}{" "}
          {msg.tipo === "ok" && (
            <Link
              href="/"
              target="_blank"
              className="font-semibold underline underline-offset-2"
            >
              Ver o site
            </Link>
          )}
        </p>
      )}

      {/* ── Temas prontos ── */}
      <div>
        <p className="label-caps text-earth">Temas prontos</p>
        <p className="mt-1 text-xs text-text/50">
          Clique para preencher tudo de uma vez e ver na prévia. Nada é
          publicado até você salvar.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => aplicar(p.cores)}
              title={p.descricao}
              className="flex items-center gap-2 rounded-2xl border border-text/15 px-3 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
            >
              <span className="flex" aria-hidden>
                {["header", "bg", "primary", "sun"].map((k) => (
                  <span
                    key={k}
                    className="h-4 w-4 rounded-full border border-black/10 -ml-1 first:ml-0"
                    style={{ backgroundColor: p.cores[k] }}
                  />
                ))}
              </span>
              {p.nome}
            </button>
          ))}
        </div>
      </div>

      {/* ── Prévia ── */}
      <div>
        <p className="label-caps text-earth">Prévia</p>
        <PreviaDoSite cores={cores} />
      </div>

      {avisos.length > 0 && (
        <div className="rounded-2xl bg-sun/25 px-4 py-3 text-sm">
          <p className="font-semibold">Atenção à legibilidade</p>
          <p className="mt-1 text-text/70">
            Pode ficar difícil de ler: {avisos.join("; ")}. Tente deixar o
            fundo e a escrita mais diferentes entre si.
          </p>
        </div>
      )}

      {/* ── As 9 cores ── */}
      <div className="grid gap-3 sm:grid-cols-2">
        {CORES_DO_TEMA.map((c) => (
          <div
            key={c.id}
            className="flex items-start gap-3 rounded-2xl border border-text/10 p-3"
          >
            <input
              type="color"
              name={c.id}
              value={cores[c.id]}
              onChange={(e) => escolherCor(c.id, e.target.value)}
              aria-label={c.label}
              className="h-11 w-11 shrink-0 cursor-pointer rounded-xl border border-text/15 bg-white p-1"
            />
            <div className="min-w-0 flex-1">
              <label className="block text-sm font-semibold">{c.label}</label>
              <p className="mt-0.5 text-xs leading-snug text-text/50">
                {c.descricao}
              </p>
              <input
                type="text"
                value={rascunho[c.id] ?? cores[c.id]}
                onChange={(e) => digitarHex(c.id, e.target.value)}
                onBlur={() => limparRascunho(c.id)}
                spellCheck={false}
                aria-label={`Código da cor ${c.label}`}
                className="mt-2 w-28 rounded-xl border border-text/15 bg-white px-3 py-1.5 font-mono text-xs uppercase outline-none transition-colors focus:border-primary"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-bg-light transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {pending ? "Salvando…" : "Salvar as cores do site"}
        </button>
        <button
          type="button"
          onClick={() => aplicar(TEMA_PADRAO)}
          disabled={naOriginal}
          className="rounded-full border border-text/15 px-5 py-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
        >
          Voltar ao original
        </button>
      </div>
      <p className="text-xs text-text/50">
        As cores valem só para a loja — este painel continua sempre com as
        cores de sempre, então você nunca fica sem conseguir mexer.
      </p>
    </form>
  );
}

/** Miniatura da loja para ela ver o resultado antes de salvar. */
function PreviaDoSite({ cores }: { cores: Tema }) {
  const sobreSol = textoLegivelSobre(cores.sun, cores);

  return (
    <div
      className="mt-2 overflow-hidden rounded-2xl border border-text/15"
      style={{ backgroundColor: cores.bg, color: cores.text }}
    >
      {/* topo */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          backgroundColor: cores.header,
          color: textoLegivelSobre(cores.header, cores),
        }}
      >
        <span
          className="font-display text-lg font-semibold"
          style={{ color: corDaMarcaSobre(cores.header, cores) }}
        >
          Gabi <em>Bijus</em>
        </span>
        <span className="flex items-center gap-3 text-xs">
          <span>Produtos</span>
          <span>Novidades</span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
            style={{
              backgroundColor: cores.gold,
              color: textoLegivelSobre(cores.gold, cores),
            }}
          >
            2
          </span>
        </span>
      </div>

      {/* seção clara */}
      <div className="px-4 py-5" style={{ backgroundColor: cores.bgLight }}>
        <p
          className="label-caps"
          style={{ color: cores.earth }}
        >
          Catálogo
        </p>
        <p className="mt-1 font-display text-xl">
          As{" "}
          <em
            style={{
              textDecoration: `underline wavy ${cores.gold}`,
              textUnderlineOffset: "0.16em",
            }}
          >
            peças
          </em>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className="rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ backgroundColor: cores.sun, color: sobreSol }}
          >
            ✦ Novidades
          </span>
          <span
            className="rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              border: `1px solid ${cores.gold}`,
              color: cores.text,
            }}
          >
            ☀ Descontos
          </span>
          <span
            className="rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ backgroundColor: cores.primary, color: cores.bgLight }}
          >
            Colares
          </span>
        </div>
        <span
          className="mt-4 inline-block rounded-full px-5 py-2.5 text-sm font-semibold"
          style={{ backgroundColor: cores.sun, color: sobreSol }}
        >
          Ver as peças
        </span>
      </div>

      {/* rodapé */}
      <div
        className="px-4 py-4 text-xs"
        style={{ backgroundColor: cores.primaryDark, color: cores.bgLight }}
      >
        <p className="label-caps" style={{ color: cores.gold }}>
          Navegue
        </p>
        <p className="mt-1 opacity-80">
          © Gabi Bijus · Feito à mão no Rio de Janeiro
        </p>
      </div>
    </div>
  );
}
