import type { Metadata } from "next";
import { loginAction } from "./actions";

export const metadata: Metadata = {
  title: "Entrar no painel",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-bg px-4">
      <p className="font-display text-3xl font-semibold text-primary">
        Gabi <em>Bijus</em>
      </p>
      <p className="label-caps mt-2 text-earth">Painel da lojista</p>

      <form
        action={loginAction}
        className="mt-8 w-full max-w-sm rounded-3xl bg-bg-light p-7 shadow-[0_4px_24px_rgba(43,29,20,0.08)]"
      >
        {erro && (
          <p className="mb-4 rounded-2xl bg-sun/30 px-4 py-3 text-sm text-text">
            {erro === "muitas-tentativas"
              ? "Muitas tentativas seguidas. Espere um minuto e tente de novo."
              : "Não foi possível entrar. Confira o e-mail e a senha."}
          </p>
        )}

        <label className="label-caps block text-earth" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1.5 w-full rounded-2xl border border-text/15 bg-white px-4 py-3 outline-none transition-colors focus:border-primary"
        />

        <label
          className="label-caps mt-5 block text-earth"
          htmlFor="password"
        >
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1.5 w-full rounded-2xl border border-text/15 bg-white px-4 py-3 outline-none transition-colors focus:border-primary"
        />

        <button
          type="submit"
          className="mt-7 w-full rounded-full bg-primary px-7 py-3.5 font-semibold text-bg-light transition-colors hover:bg-primary-dark"
        >
          Entrar
        </button>
      </form>

      <p className="mt-6 max-w-sm text-center text-xs text-text/50">
        Acesso restrito às administradoras da loja. Não há cadastro público.
      </p>
    </div>
  );
}
