"use client";

import { useState } from "react";
import { useCart } from "./CartContext";
import { formatBRL } from "@/lib/format";

/**
 * Campo de cupom — usado no drawer e na página do carrinho.
 * O cupom aplicado vive no CartContext, então vale nos dois lugares.
 */
export function CupomInput({ compacto = false }: { compacto?: boolean }) {
  const { cupom, setCupom, subtotal, desconto } = useCart();
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const aplicar = async () => {
    setErro(null);
    setCarregando(true);
    try {
      const res = await fetch("/api/cupom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo }),
      });
      const data = await res.json();
      if (!data.valido) {
        setErro(data.erro ?? "Cupom não encontrado ou fora da validade. 🌚");
        setCupom(null);
      } else {
        setCupom({
          code: data.code,
          kind: data.kind,
          value: data.value,
          minSubtotal: data.minSubtotal,
        });
        setCodigo("");
      }
    } catch {
      setErro("Não deu pra validar agora — tente de novo.");
    } finally {
      setCarregando(false);
    }
  };

  const faltaMinimo =
    cupom !== null &&
    cupom.minSubtotal !== null &&
    subtotal < cupom.minSubtotal;

  if (cupom) {
    return (
      <div className={compacto ? "" : "mt-6"}>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-sun/25 px-4 py-3">
          <p className="text-sm">
            Cupom <strong className="font-semibold">{cupom.code}</strong>{" "}
            {desconto > 0 ? "aplicado ✨" : "adicionado"}
          </p>
          <button
            type="button"
            onClick={() => setCupom(null)}
            className="link-underline shrink-0 text-sm font-medium text-text/60"
          >
            Remover
          </button>
        </div>
        {faltaMinimo && cupom.minSubtotal !== null && (
          <p className="mt-2 text-xs leading-relaxed text-text/70">
            Vale para pedidos a partir de {formatBRL(cupom.minSubtotal)} —
            faltam {formatBRL(cupom.minSubtotal - subtotal)}.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={compacto ? "" : "mt-6 rounded-3xl bg-bg px-5 py-5"}>
      <p className="label-caps text-earth">Tem cupom?</p>
      <div className="mt-2.5 flex gap-2">
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") aplicar();
          }}
          placeholder="Ex.: VERAO10"
          aria-label="Código do cupom"
          className="w-full min-w-0 rounded-full border border-text/15 bg-white px-4 py-2.5 uppercase outline-none transition-colors focus:border-primary"
        />
        <button
          type="button"
          onClick={aplicar}
          disabled={carregando || codigo.trim() === ""}
          className="shrink-0 rounded-full border-2 border-primary px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-bg-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          {carregando ? "…" : "Aplicar"}
        </button>
      </div>
      {erro && <p className="mt-2.5 text-sm text-text/70">{erro}</p>}
    </div>
  );
}
