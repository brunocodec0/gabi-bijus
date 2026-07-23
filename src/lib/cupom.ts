/** Cupom validado pelo servidor (via /api/cupom). */
export interface CupomValido {
  code: string;
  kind: "percent" | "fixed";
  value: number;
  minSubtotal: number | null;
}

/**
 * Desconto do cupom para um subtotal — 0 quando o pedido mínimo
 * não foi atingido. Nunca maior que o próprio subtotal.
 */
export function calcularDesconto(cupom: CupomValido, subtotal: number): number {
  if (cupom.minSubtotal !== null && subtotal < cupom.minSubtotal) return 0;
  const bruto =
    cupom.kind === "percent" ? (subtotal * cupom.value) / 100 : cupom.value;
  return Math.min(Math.round(bruto * 100) / 100, subtotal);
}
