"use client";

import { useRef, useState, useTransition } from "react";
import { criarCupom } from "./actions";

export function CupomAdminForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(
    null,
  );
  const [pending, start] = useTransition();

  const campo =
    "mt-1.5 w-full rounded-2xl border border-text/15 bg-white px-4 py-3 outline-none transition-colors focus:border-primary";
  const rotulo = "label-caps block text-earth";

  return (
    <form
      ref={formRef}
      action={(fd) =>
        start(async () => {
          const r = await criarCupom(fd);
          if ("erro" in r && r.erro) {
            setMsg({ tipo: "erro", texto: r.erro });
          } else {
            setMsg({ tipo: "ok", texto: "Cupom criado! ✨" });
            formRef.current?.reset();
          }
        })
      }
      className="rounded-3xl border-2 border-dashed border-text/15 p-5"
    >
      <h2 className="font-display text-xl font-medium">Novo cupom</h2>

      {msg && (
        <p
          className={`mt-3 rounded-2xl px-4 py-3 text-sm ${
            msg.tipo === "ok" ? "bg-primary/10 text-primary" : "bg-sun/30"
          }`}
        >
          {msg.texto}
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className={rotulo} htmlFor="ccode">
            Código
          </label>
          <input
            id="ccode"
            name="code"
            required
            placeholder="VERAO10"
            className={`${campo} uppercase`}
          />
        </div>
        <div>
          <label className={rotulo} htmlFor="ckind">
            Tipo
          </label>
          <select id="ckind" name="kind" className={campo}>
            <option value="percent">% de desconto</option>
            <option value="fixed">R$ de desconto</option>
          </select>
        </div>
        <div>
          <label className={rotulo} htmlFor="cvalue">
            Valor
          </label>
          <input
            id="cvalue"
            name="value"
            required
            inputMode="decimal"
            placeholder="10"
            className={campo}
          />
        </div>
        <div>
          <label className={rotulo} htmlFor="cmin">
            Pedido mínimo (R$)
          </label>
          <input
            id="cmin"
            name="minSubtotal"
            inputMode="decimal"
            placeholder="opcional"
            className={campo}
          />
        </div>
        <div>
          <label className={rotulo} htmlFor="cends">
            Válido até
          </label>
          <input id="cends" name="endsAt" type="date" className={campo} />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-bg-light transition-colors hover:bg-primary-dark disabled:opacity-50"
      >
        {pending ? "Criando…" : "Criar cupom"}
      </button>
    </form>
  );
}
