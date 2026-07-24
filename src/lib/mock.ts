import type { Campaign, Category, Product, SiteContent } from "./types";

/**
 * DADOS MOCKADOS (Etapas 1–2).
 * Na Etapa 3, tudo isso passa a vir do Supabase — os componentes
 * já consomem os tipos de `types.ts`, então a troca é só na fonte.
 */

export const siteContent: SiteContent = {
  heroTagline: "O verão eterno, feito à",
  heroHighlight: "mão",
  heroSubtitle:
    "Bijuterias artesanais feitas no Rio de Janeiro — colares, chokers e dourados orgânicos com cheiro de maresia.",
  marqueeWords: ["RIO DE JANEIRO", "VERÃO ETERNO", "FEITO À MÃO", "AFETO"],
  aboutTitle: "A mão da Gabi, o tempo do mar",
  aboutText:
    "Cada peça nasce devagar, feita à mão, uma a uma, entre o barulho da praia e a bancada da Gabi. Não é produção em série: é afeto dobrado em arame, banho dourado e pedra escolhida no olho. Do Rio, com sol, para o seu dia a dia.",
  instagramHandle: "@gabi.bijuss",
  instagramUrl: "https://instagram.com/gabi.bijuss",
  instagramImages: [
    { src: "/placeholders/p1.svg", alt: "Foto do feed: colar dourado na areia" },
    { src: "/placeholders/p4.svg", alt: "Foto do feed: choker de cordão" },
    { src: "/placeholders/p3.svg", alt: "Foto do feed: brincos ao sol" },
    { src: "/placeholders/p8.svg", alt: "Foto do feed: pulseiras empilhadas" },
    { src: "/placeholders/p5.svg", alt: "Foto do feed: body chain na praia" },
    { src: "/placeholders/p2.svg", alt: "Foto do feed: pingente orgânico" },
  ],
  // Preencher em .env.local quando o número existir (NEXT_PUBLIC_WHATSAPP_NUMBER).
  // Sem número, o pedido abre o WhatsApp com a mensagem pronta, sem destinatário.
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || null,
  footerNote: "Pagamento e frete combinados direto no WhatsApp 💛",
  careNote:
    "Suas bijus duram mais longe de água do mar, perfume e cremes. Guarde em saquinho fechado e seco.",
  politicaTrocas:
    "Deu algo errado com a sua peça? Fala com a gente pelo WhatsApp em até 7 dias após o recebimento que resolvemos juntas. 💛",
};

export const categories: Category[] = [
  { name: "Colares", slug: "colares" },
  { name: "Chokers", slug: "chokers" },
  { name: "Brincos", slug: "brincos" },
  { name: "Pulseiras", slug: "pulseiras" },
  { name: "Body chains", slug: "body-chains" },
  { name: "Anéis", slug: "aneis" },
];

export const campaign: Campaign = {
  title: "Edição Verão no Arpoador",
  slug: "verao-no-arpoador",
  text: "Peças douradas pensadas para o pôr do sol mais famoso do Rio. Poucas unidades, feitas uma a uma.",
  image: "/placeholders/p4.svg",
  ctaLabel: "Ver a coleção",
};

const care =
  "Banho dourado artesanal. Evite contato com água do mar, perfume e cremes.";

/**
 * Entrada do mock: dispensa os campos que o `products` abaixo
 * preenche sozinho (ponto focal das fotos, hero e variações), para
 * não repetir o mesmo padrão em 8 produtos e 23 imagens.
 */
type ProdutoMock = Omit<Product, "images" | "inHero" | "heroOrder" | "options"> & {
  images: { src: string; alt: string; focalX?: number; focalY?: number }[];
  inHero?: boolean;
  heroOrder?: number;
  options?: Product["options"];
};

const produtosBase: ProdutoMock[] = [
  {
    id: "1",
    name: "Colar Sol de Ipanema",
    slug: "colar-sol-de-ipanema",
    category: "Colares",
    price: 65,
    images: [
      { src: "/placeholders/p1.svg", alt: "Colar Sol de Ipanema com pingente dourado orgânico" },
      { src: "/placeholders/p3.svg", alt: "Detalhe do pingente do Colar Sol de Ipanema" },
      { src: "/placeholders/p7.svg", alt: "Colar Sol de Ipanema usado com decote" },
    ],
    badge: "novo",
    featured: true,
    description:
      "Um pingente orgânico dourado que parece ter sido moldado pelo próprio sol. Feito à mão, cada peça sai levemente diferente — como as ondas.",
    materials: `Latão com banho dourado, corrente inoxidável. ${care}`,
    sizeInfo: "Corrente de 45 cm com extensor de 5 cm. Pingente de ~2,5 cm.",
    // Exemplo de peça com escolha (o caso do pingente prata com
    // cordinha marrom): serve de banco de testes sem precisar do banco.
    options: [
      {
        id: "op-material",
        name: "Material",
        values: [
          { id: "v-dourado", label: "Dourado" },
          { id: "v-prata", label: "Prata" },
        ],
      },
      {
        id: "op-cordinha",
        name: "Cor da cordinha",
        values: [
          { id: "v-marrom", label: "Marrom" },
          { id: "v-preta", label: "Preta" },
          { id: "v-areia", label: "Areia" },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Choker Maré Alta",
    slug: "choker-mare-alta",
    category: "Chokers",
    price: 55,
    images: [
      { src: "/placeholders/p2.svg", alt: "Choker de cordão Maré Alta com fecho dourado" },
      { src: "/placeholders/p6.svg", alt: "Detalhe do fecho do Choker Maré Alta" },
    ],
    featured: true,
    description:
      "Cordão encerado trançado à mão com detalhe central dourado. Justinho no pescoço, do jeito que a maré alta pede.",
    materials: `Cordão encerado, entremeio de latão com banho dourado. ${care}`,
    sizeInfo: "Ajustável de 30 a 38 cm com fecho corrediço.",
  },
  {
    id: "3",
    name: "Brinco Estrela do Mar",
    slug: "brinco-estrela-do-mar",
    category: "Brincos",
    price: 45,
    promoPrice: 39,
    images: [
      { src: "/placeholders/p3.svg", alt: "Par de brincos Estrela do Mar dourados" },
      { src: "/placeholders/p1.svg", alt: "Brinco Estrela do Mar em uso" },
    ],
    badge: "ultimas",
    featured: true,
    description:
      "Estrelinhas douradas de textura orgânica, leves de usar o dia inteiro. Últimas unidades desta leva.",
    materials: `Latão com banho dourado, tarraxa antialérgica. ${care}`,
    sizeInfo: "Pingente de ~1,8 cm. Peso: 3 g por brinco.",
  },
  {
    id: "4",
    name: "Body Chain Arpoador",
    slug: "body-chain-arpoador",
    category: "Body chains",
    price: 89,
    images: [
      { src: "/placeholders/p5.svg", alt: "Body chain Arpoador dourada sobre pele bronzeada" },
      { src: "/placeholders/p8.svg", alt: "Body chain Arpoador vista de costas" },
      { src: "/placeholders/p4.svg", alt: "Detalhe das correntes da Body Chain Arpoador" },
    ],
    badge: "novo",
    featured: true,
    description:
      "Correntes finas que desenham o corpo como o sol desenha a pedra do Arpoador no fim de tarde. Pra usar com biquíni ou decote.",
    materials: `Correntes de latão com banho dourado, fecho lagosta. ${care}`,
    sizeInfo: "Ajustável em 3 pontos. Comprimento total de até 80 cm.",
  },
  {
    id: "5",
    name: "Pulseira Pôr do Sol no Leme",
    slug: "pulseira-por-do-sol-no-leme",
    category: "Pulseiras",
    price: 39,
    images: [
      { src: "/placeholders/p7.svg", alt: "Pulseira Pôr do Sol no Leme com contas douradas" },
      { src: "/placeholders/p2.svg", alt: "Pulseira Pôr do Sol no Leme empilhada com outras" },
    ],
    featured: false,
    description:
      "Continhas douradas intercaladas à mão, uma a uma. Fica linda sozinha e melhor ainda empilhada.",
    materials: `Contas de latão com banho dourado, fio de silicone resistente. ${care}`,
    sizeInfo: "Elástica, veste pulsos de 15 a 19 cm.",
  },
  {
    id: "6",
    name: "Anel Concha Dourada",
    slug: "anel-concha-dourada",
    category: "Anéis",
    price: 35,
    images: [
      { src: "/placeholders/p6.svg", alt: "Anel Concha Dourada ajustável" },
    ],
    badge: "esgotado",
    featured: false,
    description:
      "Uma concha achada na areia e eternizada em dourado. Esgotou — mas volta na próxima leva.",
    materials: `Latão com banho dourado. ${care}`,
    sizeInfo: "Aro ajustável, veste do 14 ao 22.",
  },
  {
    id: "7",
    name: "Colar Lua Cheia",
    slug: "colar-lua-cheia",
    category: "Colares",
    price: 59,
    images: [
      { src: "/placeholders/p4.svg", alt: "Colar Lua Cheia com medalha dourada martelada" },
      { src: "/placeholders/p5.svg", alt: "Colar Lua Cheia em uso à noite" },
    ],
    featured: false,
    description:
      "Medalha martelada à mão que segura a luz como a lua cheia segura o mar. Pro dia e pra noite.",
    materials: `Latão martelado com banho dourado, corrente inoxidável. ${care}`,
    sizeInfo: "Corrente de 50 cm com extensor de 5 cm. Medalha de ~2 cm.",
  },
  {
    id: "8",
    name: "Pulseira Calçadão",
    slug: "pulseira-calcadao",
    category: "Pulseiras",
    price: 42,
    images: [
      { src: "/placeholders/p8.svg", alt: "Pulseira Calçadão com elos ondulados" },
      { src: "/placeholders/p1.svg", alt: "Detalhe dos elos da Pulseira Calçadão" },
    ],
    badge: "novo",
    featured: false,
    description:
      "Elos ondulados inspirados no calçadão de Copacabana — o mesmo desenho que corre por este site inteiro.",
    materials: `Latão com banho dourado, fecho lagosta. ${care}`,
    sizeInfo: "18 cm com extensor de 3 cm.",
  },
];

/**
 * Completa os campos que a 0005 trouxe. Sem banco, o hero mostra os
 * destaques (mesmo comportamento de antes) e as fotos ficam
 * centralizadas — 50/50 é exatamente o `object-position` padrão.
 */
export const products: Product[] = produtosBase.map((p, i) => ({
  ...p,
  images: p.images.map((img) => ({
    ...img,
    focalX: img.focalX ?? 50,
    focalY: img.focalY ?? 50,
  })),
  inHero: p.inHero ?? p.featured,
  heroOrder: p.heroOrder ?? i,
  options: p.options ?? [],
}));

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const sameCategory = products.filter(
    (p) => p.category === product.category && p.id !== product.id,
  );
  const others = products.filter(
    (p) => p.category !== product.category && p.id !== product.id,
  );
  return [...sameCategory, ...others].slice(0, limit);
}
