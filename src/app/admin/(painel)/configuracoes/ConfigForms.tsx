"use client";

import { useState, useTransition } from "react";
import { salvarFrete, salvarSeo, trocarSenha } from "./actions";
import { TRANSPORTADORAS } from "@/lib/transportadoras";

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
