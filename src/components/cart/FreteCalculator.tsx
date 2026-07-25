"use client";

import { useState } from "react";
import { useCart } from "./CartContext";
import { formatBRL } from "@/lib/format";

interface Opcao {
  id: number;
  nome: string;
  empresa: string;
  preco: number;
  prazoDias: number | null;
}

interface Expressa {
  label: string;
  valor: number | null;
}

/**
 * Calculadora de frete (Melhor Envio) — usada no drawer e na página.
 * A opção escolhida vive no CartContext e entra no pedido do WhatsApp.
 */
export function FreteCalculator({ compacto = false }: { compacto?: boolean }) {
  const { frete, setFrete } = useCart();
  const [cep, setCep] = useState("");
  const [opcoes, setOpcoes] = useState<Opcao[]>([]);
  const [expressa, setExpressa] = useState<Expressa | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const formatCep = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  };

  const calcular = async () => {
    setErro(null);
    setOpcoes([]);
    setExpressa(null);
    setFrete(null);
    setCarregando(true);
    try {
      const res = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep }),
      });
      const data = await res.json();
      if (!data.disponivel) {
        setErro("Cálculo de frete indisponível no momento.");
      } else if (data.erro) {
        setErro(data.erro);
      } else {
        setOpcoes(data.opcoes ?? []);
        setExpressa(data.expressa ?? null);
      }
    } catch {
      setErro("Não conseguimos cotar agora. Combine pelo WhatsApp. 💛");
    } finally {
      setCarregando(false);
    }
  };

  const escolher = (opcao: Opcao) => {
    setFrete({
      label:
        `${opcao.nome}${opcao.empresa ? ` (${opcao.empresa})` : ""}` +
        (opcao.prazoDias ? ` — até ${opcao.prazoDias} dias úteis` : ""),
      price: opcao.preco,
      cep: formatCep(cep),
    });
  };

  const escolherExpressa = () => {
    if (!expressa) return;
    setFrete({
      // Sem valor fixo, price 0 → não soma no total e a mensagem mostra
      // "a combinar" (ver orderMessage em whatsapp.ts).
      label: expressa.label,
      price: expressa.valor ?? 0,
      cep: formatCep(cep),
    });
  };

  const selecionadoId = (o: Opcao) =>
    frete?.price === o.preco && frete?.label.startsWith(o.nome);

  const expressaSelecionada =
    !!expressa && !!frete && frete.label.startsWith(expressa.label);

  return (
    <div className={compacto ? "" : "mt-6 rounded-3xl bg-bg px-5 py-5"}>
      <p className="label-caps text-earth">Calcular frete</p>

      <div className="mt-2.5 flex gap-2">
        <input
          inputMode="numeric"
          value={formatCep(cep)}
          onChange={(e) => setCep(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") calcular();
          }}
          placeholder="Seu CEP"
          aria-label="CEP de entrega"
          className="w-full min-w-0 rounded-full border border-text/15 bg-white px-4 py-2.5 outline-none transition-colors focus:border-primary"
        />
        <button
          type="button"
          onClick={calcular}
          disabled={carregando || cep.replace(/\D/g, "").length !== 8}
          className="shrink-0 rounded-full border-2 border-primary px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-bg-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          {carregando ? "…" : "Calcular"}
        </button>
      </div>

      {erro && <p className="mt-2.5 text-sm text-text/70">{erro}</p>}

      {(opcoes.length > 0 || expressa) && (
        <div
          className={`mt-3 space-y-2 ${compacto ? "max-h-52 overflow-y-auto pr-1" : ""}`}
          role="radiogroup"
          aria-label="Opções de frete"
        >
          {/* Entrega expressa (Uber Flash) — destacada quando a cliente é
              da região que a Gabi entrega por app. */}
          {expressa && (
            <label
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 px-4 py-2.5 text-sm transition-colors ${
                expressaSelecionada
                  ? "border-primary bg-primary/10"
                  : "border-primary/40 bg-primary/5 hover:border-primary"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <input
                  type="radio"
                  name="frete"
                  checked={expressaSelecionada}
                  onChange={escolherExpressa}
                  className="h-4 w-4 shrink-0 accent-primary"
                />
                <span className="min-w-0">
                  <span className="block font-medium text-primary">
                    ⚡ {expressa.label}
                  </span>
                  <span className="block text-xs text-text/50">
                    Você é aqui pertinho! 💛
                  </span>
                </span>
              </span>
              <span className="shrink-0 font-display italic text-earth">
                {expressa.valor === null ? "a combinar" : formatBRL(expressa.valor)}
              </span>
            </label>
          )}

          {opcoes.map((o) => (
            <label
              key={o.id}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-sm transition-colors ${
                selecionadoId(o)
                  ? "border-primary bg-primary/5"
                  : "border-text/10 bg-white hover:border-primary/50"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <input
                  type="radio"
                  name="frete"
                  checked={!!selecionadoId(o)}
                  onChange={() => escolher(o)}
                  className="h-4 w-4 shrink-0 accent-primary"
                />
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {o.nome}
                    {o.empresa ? ` · ${o.empresa}` : ""}
                  </span>
                  {o.prazoDias && (
                    <span className="block text-xs text-text/50">
                      até {o.prazoDias} dias úteis
                    </span>
                  )}
                </span>
              </span>
              <span className="shrink-0 font-display italic text-earth">
                {formatBRL(o.preco)}
              </span>
            </label>
          ))}
          {opcoes.length > 0 && (
            <p className="pt-1 text-xs text-text/50">
              Valores estimados via Melhor Envio — confirmados na conversa. 💛
            </p>
          )}
        </div>
      )}
    </div>
  );
}
