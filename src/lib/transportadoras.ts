/**
 * Transportadoras que o Melhor Envio cota (nomes como ele os devolve).
 * A lojista marca no painel quais aparecem para a cliente — o padrão
 * é só Correios, que é onde ela consegue postar.
 */
export const TRANSPORTADORAS = [
  "Correios",
  "Jadlog",
  "Loggi",
  "Azul",
  "LATAM",
  "Buslog",
  "JeT",
  "Total Express",
] as const;

export type Transportadora = (typeof TRANSPORTADORAS)[number];
