/*
 * ─────────────────────────────────────────────
 *  ENTREGA EXPRESSA (Uber Flash / combinar no zap)
 * ─────────────────────────────────────────────
 * A Gabi é da Zona Sul do Rio e entrega por app (Uber Flash) para
 * quem é perto. Quando o CEP da cliente cai numa das faixas que a
 * lojista configura no painel, o carrinho oferece essa opção — o
 * valor é combinado no WhatsApp.
 *
 * NÃO é "use server": as faixas padrão e as funções são lidas tanto
 * no servidor (/api/frete) quanto na validação do painel.
 */

export interface FaixaCep {
  /** CEP inicial, 8 dígitos (só números). */
  de: string;
  /** CEP final, 8 dígitos (só números). */
  ate: string;
}

export interface EntregaExpressa {
  ativo: boolean;
  /** texto mostrado à cliente, ex.: "Uber Flash — combinamos no WhatsApp" */
  label: string;
  /** valor fixo opcional; null/ausente = "a combinar" (não entra no total) */
  valor: number | null;
  /** faixas de CEP consideradas "perto" */
  faixas: FaixaCep[];
}

/**
 * Sugestão inicial cobrindo o grosso da Zona Sul do Rio. A lojista
 * DEVE revisar no painel — é ela quem sabe até onde entrega. Errar
 * para mais mostra a opção a quem é longe; para menos, esconde de
 * quem é perto.
 */
export const FAIXAS_ZONA_SUL_PADRAO: FaixaCep[] = [
  // Copacabana, Leme
  { de: "22010000", ate: "22090999" },
  // Flamengo, Glória, Catete, Laranjeiras, Botafogo, Humaitá, Urca, Cosme Velho
  { de: "22210000", ate: "22299999" },
  // Ipanema, Leblon, Lagoa, Jardim Botânico, Gávea
  { de: "22400000", ate: "22479999" },
];

export const ENTREGA_EXPRESSA_PADRAO: EntregaExpressa = {
  ativo: false,
  label: "Uber Flash — combinamos a entrega no WhatsApp",
  valor: null,
  faixas: FAIXAS_ZONA_SUL_PADRAO,
};

const soDigitos = (s: string) => s.replace(/\D/g, "");

/** Normaliza o que veio do banco num objeto de entrega expressa válido. */
export function normalizarExpressa(valor: unknown): EntregaExpressa {
  const bruto = (valor ?? {}) as Partial<EntregaExpressa>;
  const faixas = Array.isArray(bruto.faixas)
    ? bruto.faixas
        .map((f) => ({ de: soDigitos(String(f?.de ?? "")), ate: soDigitos(String(f?.ate ?? "")) }))
        .filter((f) => f.de.length === 8 && f.ate.length === 8)
    : ENTREGA_EXPRESSA_PADRAO.faixas;

  return {
    ativo: bruto.ativo === true,
    label:
      typeof bruto.label === "string" && bruto.label.trim()
        ? bruto.label.trim()
        : ENTREGA_EXPRESSA_PADRAO.label,
    valor:
      typeof bruto.valor === "number" && bruto.valor >= 0 ? bruto.valor : null,
    faixas: faixas.length ? faixas : ENTREGA_EXPRESSA_PADRAO.faixas,
  };
}

/** true quando o CEP cai em alguma faixa configurada. */
export function cepNaFaixa(cep: string, faixas: FaixaCep[]): boolean {
  const n = Number(soDigitos(cep));
  if (soDigitos(cep).length !== 8) return false;
  return faixas.some((f) => n >= Number(f.de) && n <= Number(f.ate));
}
