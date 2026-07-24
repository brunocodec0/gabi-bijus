/*
 * ─────────────────────────────────────────────
 *  TEMA DO SITE — cores editáveis pelo painel
 * ─────────────────────────────────────────────
 * O site inteiro é pintado por 9 cores (os tokens do @theme em
 * globals.css). Toda classe do Tailwind aponta para uma variável
 * CSS — ex.: `.bg-primary { background-color: var(--color-primary) }`.
 * Por isso basta reescrever essas variáveis no <html> para repintar
 * a loja inteira, sem tocar em componente nenhum.
 *
 * O valor fica salvo em site_content (chave "tema"). Se não existir,
 * ou vier algo inválido, cai no padrão — a loja nunca quebra.
 *
 * NÃO é "use server": daqui saem constantes lidas também no cliente.
 */

export interface DefinicaoDeCor {
  /** chave salva no banco e nome do campo no formulário */
  id: string;
  /** variável CSS correspondente no globals.css */
  cssVar: string;
  /** nome amigável mostrado no painel */
  label: string;
  /** explicação em português de onde essa cor aparece */
  descricao: string;
  padrao: string;
}

/** As 9 cores que regem o site, na ordem em que aparecem no painel. */
export const CORES_DO_TEMA: readonly DefinicaoDeCor[] = [
  {
    id: "bg",
    cssVar: "--color-bg",
    label: "Fundo do site",
    descricao: "A cor base atrás de tudo, incluindo o topo com o menu.",
    padrao: "#f5efe4",
  },
  {
    id: "header",
    cssVar: "--color-header",
    label: "Fundo do topo (menu)",
    descricao:
      "A barra de cima, com o nome da loja e o menu. Pode ser diferente do fundo do site — a escrita se ajusta sozinha para continuar legível.",
    padrao: "#f5efe4",
  },
  {
    id: "bgLight",
    cssVar: "--color-bg-light",
    label: "Fundo das seções",
    descricao:
      "Áreas mais claras, como o catálogo. Também é a cor da escrita em cima dos botões escuros.",
    padrao: "#fbf8f1",
  },
  {
    id: "text",
    cssVar: "--color-text",
    label: "Textos",
    descricao: "Cor das escritas em geral e dos títulos.",
    padrao: "#2b1d14",
  },
  {
    id: "primary",
    cssVar: "--color-primary",
    label: "Botões e links",
    descricao:
      "O verde-petróleo dos botões principais, links, ícone do carrinho e do nome “Gabi Bijus” no topo.",
    padrao: "#1f5a5a",
  },
  {
    id: "primaryDark",
    cssVar: "--color-primary-dark",
    label: "Rodapé",
    descricao: "A barra escura no pé do site e o hover dos botões.",
    padrao: "#174545",
  },
  {
    id: "earth",
    cssVar: "--color-earth",
    label: "Blocos editoriais",
    descricao: "Marrom das etiquetas de seção (“Catálogo”, “No feed”…).",
    padrao: "#7b4b33",
  },
  {
    id: "gold",
    cssVar: "--color-gold",
    label: "Detalhes dourados",
    descricao:
      "Rabiscos embaixo das palavras, bordas, bolinha do carrinho e seleção de texto.",
    padrao: "#c9a24b",
  },
  {
    id: "sun",
    cssVar: "--color-sun",
    label: "Destaques e campanha",
    descricao:
      "O botão “Ver as peças”, as abas Novidades/Descontos e as etiquetas das peças.",
    padrao: "#f2c14e",
  },
  {
    id: "sea",
    cssVar: "--color-sea",
    label: "Acento",
    descricao: "Cor de apoio, usada em detalhes pontuais.",
    padrao: "#2e5fa3",
  },
];

export type Tema = Record<string, string>;

export const TEMA_PADRAO: Tema = Object.fromEntries(
  CORES_DO_TEMA.map((c) => [c.id, c.padrao]),
);

/** Só aceitamos #rrggbb — impede qualquer injeção na tag <style>. */
export const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/**
 * Converte o que veio do banco (ou do formulário) num tema válido:
 * campo inválido/ausente volta para o padrão.
 */
export function normalizarTema(valor: unknown): Tema {
  const bruto = (valor ?? {}) as Record<string, unknown>;
  const tema: Tema = { ...TEMA_PADRAO };
  for (const cor of CORES_DO_TEMA) {
    const v = bruto[cor.id];
    if (typeof v === "string" && HEX_RE.test(v.trim())) {
      tema[cor.id] = v.trim().toLowerCase();
    }
  }
  return tema;
}

/** true quando o tema é exatamente a paleta original. */
export function ehTemaPadrao(tema: Tema): boolean {
  return CORES_DO_TEMA.every((c) => tema[c.id] === c.padrao);
}

/* ── Contraste ────────────────────────────────────────────────── */

function canaisRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Luminância relativa (WCAG) — 0 = preto, 1 = branco. */
export function luminancia(hex: string): number {
  const [r, g, b] = canaisRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste entre duas cores (WCAG): de 1 a 21. */
export function contraste(a: string, b: string): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Escolhe, entre a cor de texto e a de fundo claro do próprio tema,
 * qual fica legível em cima de `fundo`. É isso que faz o botão de
 * destaque virar "escrita branca" sozinho quando a lojista escolhe
 * um fundo escuro (verde, por exemplo).
 */
export function textoLegivelSobre(fundo: string, tema: Tema): string {
  const claro = tema.bgLight ?? TEMA_PADRAO.bgLight;
  const escuro = tema.text ?? TEMA_PADRAO.text;
  return contraste(fundo, claro) >= contraste(fundo, escuro) ? claro : escuro;
}

/**
 * Cor do nome “Gabi Bijus” e do ícone do carrinho no topo.
 * Preserva o verde da marca enquanto ele for legível sobre a barra;
 * se a lojista escolher um topo escuro (ou o próprio verde), troca
 * pela cor clara — senão o logo sumiria no fundo.
 */
export function corDaMarcaSobre(fundo: string, tema: Tema): string {
  const marca = tema.primary ?? TEMA_PADRAO.primary;
  return contraste(marca, fundo) >= 4.5 ? marca : textoLegivelSobre(fundo, tema);
}

/* ── Geração do CSS ───────────────────────────────────────────── */

/**
 * Monta o CSS que sobrescreve os tokens no <html>.
 *
 * Usa `html:root` (e não só `:root`) de propósito: tem
 * especificidade maior que o `:root` gerado pelo Tailwind, então
 * vence a cascata independentemente da ordem em que o Next injetar
 * a folha de estilo.
 *
 * As variáveis `--color-on-*` são derivadas, não escolhidas: garantem
 * que a escrita em cima desses fundos continue legível sozinha.
 */
export function cssDoTema(tema: Tema): string {
  const linhas = CORES_DO_TEMA.map((c) => `${c.cssVar}:${tema[c.id]}`);
  linhas.push(`--color-on-sun:${textoLegivelSobre(tema.sun, tema)}`);
  linhas.push(`--color-on-gold:${textoLegivelSobre(tema.gold, tema)}`);
  linhas.push(`--color-on-header:${textoLegivelSobre(tema.header, tema)}`);
  linhas.push(`--color-header-brand:${corDaMarcaSobre(tema.header, tema)}`);
  return `html:root{${linhas.join(";")}}`;
}

/* ── Temas prontos ────────────────────────────────────────────── */

export interface Preset {
  id: string;
  nome: string;
  descricao: string;
  cores: Tema;
}

export const PRESETS: readonly Preset[] = [
  {
    id: "original",
    nome: "Verão eterno",
    descricao: "A paleta original: creme, petróleo e dourado.",
    cores: TEMA_PADRAO,
  },
  {
    id: "verde",
    nome: "Verde praia",
    descricao: "Barra do topo verde e tudo que era amarelo vira verde.",
    cores: {
      bg: "#f4f1e8",
      header: "#1f5a5a",
      bgLight: "#fbfaf5",
      text: "#20302b",
      primary: "#1f5a5a",
      primaryDark: "#123c3c",
      earth: "#46695c",
      gold: "#8fbfae",
      sun: "#2e7d6f",
      sea: "#35a7c4",
    },
  },
  {
    id: "ciano",
    nome: "Céu e mar",
    descricao: "Azul-claro/ciano nos destaques e no rodapé.",
    cores: {
      bg: "#f1f7f9",
      header: "#17788f",
      bgLight: "#fbfdfe",
      text: "#16323c",
      primary: "#17788f",
      primaryDark: "#0f5567",
      earth: "#2c6274",
      gold: "#7fd4e8",
      sun: "#35b6d8",
      sea: "#2e5fa3",
    },
  },
  {
    id: "terracota",
    nome: "Terracota",
    descricao: "Barro, areia e cobre — bem artesanal.",
    cores: {
      bg: "#f7f0e9",
      header: "#f7f0e9",
      bgLight: "#fdfaf7",
      text: "#33231c",
      primary: "#9c4f34",
      primaryDark: "#6e3423",
      earth: "#7a4a38",
      gold: "#c98f57",
      sun: "#e8a05c",
      sea: "#3f7f92",
    },
  },
];

/* ── Avisos de legibilidade ───────────────────────────────────── */

/**
 * Confere as combinações que realmente acontecem na tela e devolve
 * avisos em português. Não bloqueia nada — só alerta a lojista antes
 * de ela publicar algo ilegível.
 */
export function avisosDeContraste(tema: Tema): string[] {
  const avisos: string[] = [];
  const checar = (a: string, b: string, onde: string) => {
    if (contraste(a, b) < 4.5) avisos.push(onde);
  };

  checar(tema.text, tema.bg, "o texto sobre o fundo do site");
  checar(textoLegivelSobre(tema.header, tema), tema.header, "o menu do topo");
  checar(tema.text, tema.bgLight, "o texto sobre o fundo das seções");
  checar(tema.bgLight, tema.primary, "a escrita dentro dos botões");
  checar(tema.bgLight, tema.primaryDark, "a escrita do rodapé");
  checar(tema.earth, tema.bgLight, "as etiquetas de seção");

  return avisos;
}
