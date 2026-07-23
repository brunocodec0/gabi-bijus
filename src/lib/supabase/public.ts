import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de LEITURA PÚBLICA (sem sessão/cookies).
 *
 * O site público só lê dados públicos (produtos e campanhas ativos,
 * conteúdo do site), protegidos por RLS. Usar um cliente sem cookies
 * permite que as páginas sejam pré-renderizadas e cacheadas — se
 * dependessem de `cookies()`, toda página viraria dinâmica.
 *
 * Para o painel (/admin), use `supabase/server.ts`, que carrega a
 * sessão do admin a partir dos cookies.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
