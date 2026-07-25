"use client";

import { useState, useTransition } from "react";
import {
  salvarEntregaExpressa,
  salvarFrete,
  salvarSeo,
  trocarSenha,
} from "./actions";
import { TRANSPORTADORAS } from "@/lib/transportadoras";
import type { EntregaExpressa, FaixaCep } from "@/lib/entrega-expressa";

type Msg = { tipo: "ok" | "erro"; texto: string } | null;

export function SeoForm({
  inicial,
}: {
  inicial: { nome: string; descricao: string; ogImage: string };
}) {
  const [msg, setMsg] = useState<Msg>(null);
  const [pending, start] = useTransition();

  const campo =
    "mt-1.5 w-full rounded-2xl border border-text/15 bg-white px-4 py-3 outline-none transition-colors focus:border-primary";

  return (
    <form
      action={(fd) =>
        start(async () => {
          const r = await salvarSeo(fd);
          setMsg(
            "erro" in r && r.erro
              ? { tipo: "erro", texto: r.erro }
              : { tipo: "ok", texto: "Dados da loja salvos. ✨" },
          );
        })
      }
      className="space-y-4"
    >
      {msg && (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${msg.tipo === "ok" ? "bg-primary/10 text-primary" : "bg-sun/30"}`}
        >
          {msg.texto}
        </p>
      )}
      <div>
        <label className="label-caps block text-earth">Nome da loja</label>
        <input name="nome" defaultValue={inicial.nome} className={campo} />
      </div>
      <div>
        <label className="label-caps block text-earth">
          Descrição para o Google (SEO)
        </label>
        <textarea
          name="descricao"
          rows={2}
          defaultValue={inicial.descricao}
          className={campo}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-bg-light transition-colors hover:bg-primary-dark disabled:opacity-50"
      >
        {pending ? "Salvando…" : "Salvar dados da loja"}
      </button>
    </form>
  );
}

export function FreteForm({
  inicial,
  tokenConfigurado,
}: {
  inicial: {
    cepOrigem: string;
    pesoG: number;
    alturaCm: number;
    larguraCm: number;
    comprimentoCm: number;
    empresas: string[];
  };
  tokenConfigurado: boolean;
}) {
  const [msg, setMsg] = useState<Msg>(null);
  const [pending, start] = useTransition();

  const campo =
    "mt-1.5 w-full rounded-2xl border border-text/15 bg-white px-4 py-3 outline-none transition-colors focus:border-primary";

  return (
    <form
      action={(fd) =>
        start(async () => {
          const r = await salvarFrete(fd);
          setMsg(
            "erro" in r && r.erro
              ? { tipo: "erro", texto: r.erro }
              : { tipo: "ok", texto: "Dados de entrega salvos. 📦" },
          );
        })
      }
      className="space-y-4"
    >
      {msg && (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${msg.tipo === "ok" ? "bg-primary/10 text-primary" : "bg-sun/30"}`}
        >
          {msg.texto}
        </p>
      )}

      <p
        className={`rounded-2xl px-4 py-3 text-sm ${
          tokenConfigurado ? "bg-primary/10 text-primary" : "bg-sun/30"
        }`}
      >
        {tokenConfigurado
          ? "Conexão com o Melhor Envio ativa ✅"
          : "Falta o token do Melhor Envio (variável MELHOR_ENVIO_TOKEN) — enquanto isso, o carrinho não mostra a calculadora."}
      </p>

      <div>
        <label className="label-caps block text-earth">
          CEP de origem (de onde as encomendas saem)
        </label>
        <input
          name="cepOrigem"
          defaultValue={inicial.cepOrigem}
          inputMode="numeric"
          placeholder="22000-000"
          className={campo}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(
          [
            ["pesoG", "Peso (g)", inicial.pesoG],
            ["alturaCm", "Altura (cm)", inicial.alturaCm],
            ["larguraCm", "Largura (cm)", inicial.larguraCm],
            ["comprimentoCm", "Compr. (cm)", inicial.comprimentoCm],
          ] as const
        ).map(([name, label, valor]) => (
          <div key={name}>
            <label className="label-caps block text-earth">{label}</label>
            <input
              name={name}
              defaultValue={valor}
              inputMode="numeric"
              className={campo}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-text/50">
        Pacote padrão usado na cotação (caixinha típica dos pedidos).
      </p>

      <div>
        <p className="label-caps text-earth">
          Transportadoras que aparecem para a cliente
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-bg p-4 sm:grid-cols-4">
          {TRANSPORTADORAS.map((t) => (
            <label key={t} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="empresas"
                value={t}
                defaultChecked={inicial.empresas.includes(t)}
                className="h-4 w-4 accent-primary"
              />
              {t}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-text/50">
          Deixe marcada só quem você consegue postar — a cliente vê apenas
          essas opções no carrinho.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-bg-light transition-colors hover:bg-primary-dark disabled:opacity-50"
      >
        {pending ? "Salvando…" : "Salvar dados de entrega"}
      </button>
    </form>
  );
}

export function SenhaForm() {
  const [msg, setMsg] = useState<Msg>(null);
  const [pending, start] = useTransition();

  const campo =
    "mt-1.5 w-full rounded-2xl border border-text/15 bg-white px-4 py-3 outline-none transition-colors focus:border-primary";

  return (
    <form
      action={(fd) =>
        start(async () => {
          const r = await trocarSenha(fd);
          setMsg(
            "erro" in r && r.erro
              ? { tipo: "erro", texto: r.erro }
              : { tipo: "ok", texto: "Senha trocada com sucesso. 🔒" },
          );
        })
      }
      className="space-y-4"
    >
      {msg && (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${msg.tipo === "ok" ? "bg-primary/10 text-primary" : "bg-sun/30"}`}
        >
          {msg.texto}
        </p>
      )}
      <div>
        <label className="label-caps block text-earth">Nova senha</label>
        <input
          name="senha"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={campo}
        />
      </div>
      <div>
        <label className="label-caps block text-earth">
          Repita a nova senha
        </label>
        <input
          name="confirma"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={campo}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-bg-light transition-colors hover:bg-primary-dark disabled:opacity-50"
      >
        {pending ? "Trocando…" : "Trocar minha senha"}
      </button>
    </form>
  );
}

/**
 * Entrega expressa (Uber Flash) por faixa de CEP.
 * A Gabi é da Zona Sul e entrega por app para quem é perto; quando o
 * CEP da cliente cai numa faixa, o carrinho oferece essa opção, com o
 * valor combinado no WhatsApp.
 */
export function EntregaExpressaForm({ inicial }: { inicial: EntregaExpressa }) {
  const [ativo, setAtivo] = useState(inicial.ativo);
  const [label, setLabel] = useState(inicial.label);
  const [valor, setValor] = useState(inicial.valor === null ? "" : String(inicial.valor));
  const [faixas, setFaixas] = useState<FaixaCep[]>(inicial.faixas);
  const [msg, setMsg] = useState<Msg>(null);
  const [pending, start] = useTransition();

  const campo =
    "w-full rounded-2xl border border-text/15 bg-white px-4 py-3 outline-none transition-colors focus:border-primary";

  const formatarCep = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  };

  const mudarFaixa = (i: number, campo: keyof FaixaCep, v: string) =>
    setFaixas((fs) =>
      fs.map((f, j) => (j === i ? { ...f, [campo]: v.replace(/\D/g, "").slice(0, 8) } : f)),
    );

  const salvar = () =>
    start(async () => {
      const r = await salvarEntregaExpressa({
        ativo,
        label,
        valor: valor.trim() === "" ? null : Number(valor.replace(",", ".")),
        faixas: faixas.filter((f) => f.de || f.ate),
      });
      setMsg(
        "erro" in r && r.erro
          ? { tipo: "erro", texto: r.erro }
          : { tipo: "ok", texto: "Entrega expressa salva. ⚡" },
      );
    });

  return (
    <div className="space-y-4">
      {msg && (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${msg.tipo === "ok" ? "bg-primary/10 text-primary" : "bg-sun/30"}`}
        >
          {msg.texto}
        </p>
      )}

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={ativo}
          onChange={(e) => setAtivo(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        Oferecer entrega expressa (Uber Flash) para a região
      </label>

      <div>
        <label className="label-caps block text-earth">
          Texto que a cliente vê
        </label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className={`mt-1.5 ${campo}`}
          placeholder="Uber Flash — combinamos a entrega no WhatsApp"
        />
      </div>

      <div>
        <label className="label-caps block text-earth">
          Valor (deixe vazio para “a combinar”)
        </label>
        <input
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className={`mt-1.5 w-40 ${campo}`}
          placeholder="a combinar"
        />
      </div>

      <div>
        <p className="label-caps text-earth">
          Faixas de CEP que contam como “perto”
        </p>
        <p className="mt-1 text-xs text-text/60">
          Confira com calma — é você quem sabe até onde entrega. A cliente
          cujo CEP cair entre o inicial e o final de qualquer faixa verá a
          opção. A sugestão já vem com a Zona Sul.
        </p>
        <div className="mt-2 space-y-2">
          {faixas.map((f, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                inputMode="numeric"
                value={formatarCep(f.de)}
                onChange={(e) => mudarFaixa(i, "de", e.target.value)}
                placeholder="22010-000"
                aria-label={`CEP inicial da faixa ${i + 1}`}
                className="w-32 rounded-xl border border-text/15 bg-white px-3 py-2 outline-none focus:border-primary"
              />
              <span className="text-text/40">até</span>
              <input
                inputMode="numeric"
                value={formatarCep(f.ate)}
                onChange={(e) => mudarFaixa(i, "ate", e.target.value)}
                placeholder="22090-999"
                aria-label={`CEP final da faixa ${i + 1}`}
                className="w-32 rounded-xl border border-text/15 bg-white px-3 py-2 outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setFaixas((fs) => fs.filter((_, j) => j !== i))}
                className="rounded-xl px-2 py-1 text-sm text-text/50 hover:text-red-700"
                aria-label={`Remover faixa ${i + 1}`}
              >
                remover
              </button>
            </div>
          ))}
        </div>
        {faixas.length < 30 && (
          <button
            type="button"
            onClick={() => setFaixas((fs) => [...fs, { de: "", ate: "" }])}
            className="mt-2 rounded-full border border-text/15 px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
          >
            + Adicionar faixa
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={salvar}
        disabled={pending}
        className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-bg-light transition-colors hover:bg-primary-dark disabled:opacity-50"
      >
        {pending ? "Salvando…" : "Salvar entrega expressa"}
      </button>
    </div>
  );
}
