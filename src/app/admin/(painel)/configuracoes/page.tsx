import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { normalizarTema } from "@/lib/tema";
import { FreteForm, SenhaForm, SeoForm } from "./ConfigForms";
import { TemaForm } from "./TemaForm";

export const metadata: Metadata = { title: "Configurações" };

interface SeoValue {
  nome?: string;
  descricao?: string;
  og_image?: string | null;
}

interface FreteValue {
  cep_origem?: string;
  peso_g?: number;
  altura_cm?: number;
  largura_cm?: number;
  comprimento_cm?: number;
  empresas?: string[];
}

export default async function AdminConfiguracoes() {
  const { supabase, adminEmail } = await requireAdmin();

  const [{ data: seoRow }, { data: freteRow }, { data: temaRow }, { data: admins }] =
    await Promise.all([
      supabase.from("site_content").select("value").eq("key", "seo").maybeSingle(),
      supabase
        .from("site_content")
        .select("value")
        .eq("key", "frete")
        .maybeSingle(),
      supabase
        .from("site_content")
        .select("value")
        .eq("key", "tema")
        .maybeSingle(),
      supabase.from("admin_users").select("email").order("created_at"),
    ]);
  const seo = (seoRow?.value ?? {}) as SeoValue;
  const frete = (freteRow?.value ?? {}) as FreteValue;
  const tema = normalizarTema(temaRow?.value);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-medium">Configurações</h1>

      <section className="rounded-3xl border border-text/10 bg-white p-6">
        <h2 className="font-display text-xl font-medium">Dados da loja</h2>
        <div className="mt-4">
          <SeoForm
            inicial={{
              nome: seo.nome ?? "Gabi Bijus",
              descricao:
                seo.descricao ??
                "Bijuterias artesanais feitas à mão no Rio de Janeiro.",
              ogImage: seo.og_image ?? "",
            }}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-text/10 bg-white p-6">
        <h2 className="font-display text-xl font-medium">Cores do site</h2>
        <p className="mt-1 text-sm text-text/60">
          Todo o visual da loja sai destas cores. Mexa à vontade, veja na
          prévia e salve quando gostar — dá para voltar ao original a
          qualquer momento.
        </p>
        <div className="mt-4">
          <TemaForm inicial={tema} />
        </div>
      </section>

      <section className="rounded-3xl border border-text/10 bg-white p-6">
        <h2 className="font-display text-xl font-medium">
          Entrega (Melhor Envio)
        </h2>
        <p className="mt-1 text-sm text-text/60">
          Usado para a calculadora de frete do carrinho.
        </p>
        <div className="mt-4">
          <FreteForm
            inicial={{
              cepOrigem: frete.cep_origem ?? "",
              pesoG: frete.peso_g ?? 300,
              alturaCm: frete.altura_cm ?? 4,
              larguraCm: frete.largura_cm ?? 12,
              comprimentoCm: frete.comprimento_cm ?? 17,
              empresas: frete.empresas ?? ["Correios"],
            }}
            tokenConfigurado={!!process.env.MELHOR_ENVIO_TOKEN}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-text/10 bg-white p-6">
        <h2 className="font-display text-xl font-medium">Minha senha</h2>
        <p className="mt-1 text-sm text-text/60">
          Você está logada como <strong>{adminEmail}</strong>.
        </p>
        <div className="mt-4">
          <SenhaForm />
        </div>
      </section>

      <section className="rounded-3xl border border-text/10 bg-white p-6">
        <h2 className="font-display text-xl font-medium">
          Contas administradoras
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm">
          {(admins ?? []).map((a) => (
            <li key={a.email} className="rounded-xl bg-bg px-4 py-2.5">
              {a.email}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-text/50">
          Não há cadastro pelo site — contas novas só podem ser criadas no
          painel do Supabase (Authentication → Users) e registradas na tabela
          admin_users. O passo a passo está no README do projeto.
        </p>
      </section>
    </div>
  );
}
