import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { permitido } from "@/lib/rate-limit";

/**
 * Valida um código de cupom via função `validar_cupom` (security
 * definer) — a tabela de cupons não é listável publicamente.
 */

const bodySchema = z.object({
  codigo: z.string().trim().min(1).max(40),
});

export async function POST(request: Request) {
  // evita enumeração de códigos na força bruta
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconhecido";
  if (!permitido(`cupom:${ip}`)) {
    return NextResponse.json(
      { valido: false, erro: "Muitas tentativas — espere um minuto." },
      { status: 429 },
    );
  }

  let codigo: string;
  try {
    codigo = bodySchema.parse(await request.json()).codigo;
  } catch {
    return NextResponse.json({ valido: false }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("validar_cupom", { codigo });
    if (error) throw error;

    const cupom = Array.isArray(data) ? data[0] : data;
    if (!cupom) return NextResponse.json({ valido: false });

    return NextResponse.json({
      valido: true,
      code: cupom.code,
      kind: cupom.kind,
      value: Number(cupom.value),
      minSubtotal:
        cupom.min_subtotal !== null ? Number(cupom.min_subtotal) : null,
    });
  } catch (err) {
    console.error("[cupom] validação falhou:", err);
    return NextResponse.json({ valido: false }, { status: 502 });
  }
}
