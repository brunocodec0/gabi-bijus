/**
 * Rate limiting simples em memória (janela deslizante) para o login.
 * Em serverless (Vercel) cada instância tem a própria memória — é uma
 * proteção de melhor esforço contra força bruta, somada ao rate limit
 * do próprio Supabase Auth. Sem dependências pagas.
 */

interface Janela {
  tentativas: number[];
}

const janelas = new Map<string, Janela>();

const LIMITE = 5; // tentativas
const JANELA_MS = 60_000; // por minuto

export function permitido(chave: string): boolean {
  const agora = Date.now();
  const j = janelas.get(chave) ?? { tentativas: [] };
  j.tentativas = j.tentativas.filter((t) => agora - t < JANELA_MS);

  if (j.tentativas.length >= LIMITE) {
    janelas.set(chave, j);
    return false;
  }

  j.tentativas.push(agora);
  janelas.set(chave, j);

  // limpeza ocasional pra não crescer sem limite
  if (janelas.size > 1000) {
    for (const [k, v] of janelas) {
      if (v.tentativas.every((t) => agora - t >= JANELA_MS)) janelas.delete(k);
    }
  }
  return true;
}
