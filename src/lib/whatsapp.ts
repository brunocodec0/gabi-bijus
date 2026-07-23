import { formatBRL } from "./format";

/**
 * Links de pedido via WhatsApp — SEMPRE o link gratuito wa.me
 * (nunca a API paga do WhatsApp Business).
 * Sem número configurado, abre o WhatsApp com a mensagem pronta
 * e a cliente escolhe o destinatário (útil em dev/testes).
 */
export function waLink(text: string, number?: string | null): string {
  const encoded = encodeURIComponent(text);
  return number
    ? `https://wa.me/${number}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
}

export interface OrderLine {
  name: string;
  qty: number;
  unitPrice: number;
  url?: string;
}

export interface FreteEscolhido {
  label: string; // ex.: "PAC (Correios) — até 8 dias úteis"
  price: number;
  cep: string;
}

export interface CupomAplicado {
  code: string;
  desconto: number;
}

export interface OrderExtras {
  frete?: FreteEscolhido | null;
  cupom?: CupomAplicado | null;
}

/** Mensagem formatada do pedido: peças com link, cupom, frete estimado e total. */
export function orderMessage(
  lines: OrderLine[],
  extras: OrderExtras = {},
): string {
  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
  const body = lines
    .map(
      (l) =>
        `• ${l.qty}x ${l.name} — ${formatBRL(l.unitPrice)}` +
        (l.url ? `\n${l.url}` : ""),
    )
    .join("\n");

  const cupom =
    extras.cupom && extras.cupom.desconto > 0 ? extras.cupom : null;
  const frete = extras.frete ?? null;

  if (!cupom && !frete) {
    return `Oi! Quero fazer um pedido 🌞\n${body}\nTotal: ${formatBRL(subtotal)}`;
  }

  const linhas = [`Oi! Quero fazer um pedido 🌞`, body];
  linhas.push(`Subtotal: ${formatBRL(subtotal)}`);
  if (cupom) {
    linhas.push(`Cupom ${cupom.code}: −${formatBRL(cupom.desconto)}`);
  }
  if (frete) {
    linhas.push(
      `Frete estimado (${frete.label}, CEP ${frete.cep}): ${formatBRL(frete.price)}`,
    );
  }
  const total =
    Math.max(0, subtotal - (cupom?.desconto ?? 0)) + (frete?.price ?? 0);
  linhas.push(`Total: ${formatBRL(total)}`);
  return linhas.join("\n");
}
