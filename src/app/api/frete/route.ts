import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * Cotação de frete via Melhor Envio (API gratuita).
 * O token fica APENAS no servidor (MELHOR_ENVIO_TOKEN). O CEP de origem
 * e o pacote padrão são configurados no painel (Configurações → Entrega).
 * A cotação é uma estimativa — a etiqueta é comprada pela lojista no
 * painel do Melhor Envio, como de costume.
 */

const bodySchema = z.object({
  cep: z
    .string()
    .transform((s) => s.replace(/\D/g, ""))
    .pipe(z.string().length(8)),
});

interface FreteConfig {
  cep_origem?: string;
  peso_g?: number;
  altura_cm?: number;
  largura_cm?: number;
  comprimento_cm?: number;
  /** transportadoras exibidas à cliente; vazio/ausente = só Correios */
  empresas?: string[];
}

interface MelhorEnvioServico {
  id: number;
  name: string;
  price?: string;
  delivery_time?: number;
  company?: { name: string };
  error?: string;
}

export async function POST(request: Request) {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  if (!token) {
    return NextResponse.json({ disponivel: false });
  }

  let cep: string;
  try {
    cep = bodySchema.parse(await request.json()).cep;
  } catch {
    return NextResponse.json(
      { disponivel: true, erro: "CEP inválido — confira os 8 dígitos." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("site_content")
    .select("value")
    .eq("key", "frete")
    .maybeSingle();
  const config = (row?.value ?? {}) as FreteConfig;
  if (!config.cep_origem) {
    return NextResponse.json({ disponivel: false });
  }

  try {
    const resposta = await fetch(
      "https://melhorenvio.com.br/api/v2/me/shipment/calculate",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "GabiBijus (site)",
        },
        body: JSON.stringify({
          from: { postal_code: config.cep_origem.replace(/\D/g, "") },
          to: { postal_code: cep },
          package: {
            weight: (config.peso_g ?? 300) / 1000,
            height: config.altura_cm ?? 4,
            width: config.largura_cm ?? 12,
            length: config.comprimento_cm ?? 17,
          },
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!resposta.ok) throw new Error(`Melhor Envio HTTP ${resposta.status}`);

    const servicos = (await resposta.json()) as MelhorEnvioServico[];

    // A lojista escolhe as transportadoras no painel (padrão: só Correios,
    // que é a que ela consegue postar).
    const permitidas = (
      config.empresas?.length ? config.empresas : ["Correios"]
    ).map((e) => e.toLowerCase());

    const opcoes = servicos
      .filter((s) => !s.error && s.price)
      .filter((s) =>
        permitidas.some((p) => (s.company?.name ?? "").toLowerCase().includes(p)),
      )
      .map((s) => ({
        id: s.id,
        nome: s.name,
        empresa: s.company?.name ?? "",
        preco: Number(s.price),
        prazoDias: s.delivery_time ?? null,
      }))
      .sort((a, b) => a.preco - b.preco);

    if (opcoes.length === 0) {
      return NextResponse.json({
        disponivel: true,
        erro: "Nenhuma opção de entrega para esse CEP. Combine pelo WhatsApp. 💛",
      });
    }

    return NextResponse.json({ disponivel: true, opcoes });
  } catch (err) {
    console.error("[frete] cotação falhou:", err);
    return NextResponse.json(
      {
        disponivel: true,
        erro: "Não conseguimos cotar agora — o frete pode ser combinado pelo WhatsApp. 💛",
      },
      { status: 502 },
    );
  }
}
