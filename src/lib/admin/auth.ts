import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Garante sessão de admin em páginas e server actions do painel.
 * Não sendo admin, derruba a sessão e manda para o login com erro.
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id,email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) {
    await supabase.auth.signOut();
    redirect("/admin/login?erro=nao-autorizado");
  }

  return { supabase, user, adminEmail: adminRow.email };
}
