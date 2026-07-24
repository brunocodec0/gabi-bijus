"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  cartLineId,
  effectivePrice,
  type OptionSelection,
  type Product,
} from "@/lib/types";
import { calcularDesconto, type CupomValido } from "@/lib/cupom";
import type { FreteEscolhido } from "@/lib/whatsapp";

/**
 * Carrinho v1: guarda só { slug, qty } no localStorage e resolve
 * os dados do produto na renderização — preços e disponibilidade
 * sempre atuais. Os produtos e as configurações da loja chegam por
 * props do layout (servidor), então a fonte (mock ou Supabase) é
 * transparente aqui. Na v2 (checkout com pagamento), esta camada
 * vira a fonte dos itens do pedido sem mudança de interface.
 */

// v2: cada linha carrega as escolhas da cliente (material, cor da
// cordinha…). A mesma peça em duas cores são duas linhas.
const STORAGE_KEY = "gabi-bijus-carrinho-v2";
const STORAGE_KEY_V1 = "gabi-bijus-carrinho-v1";

interface StoredItem {
  slug: string;
  qty: number;
  selection?: OptionSelection;
}

export interface CartItem {
  /** identidade da linha: slug + escolhas */
  id: string;
  product: Product;
  qty: number;
  selection: OptionSelection;
  /** false quando o produto foi esgotado/desativado após entrar no carrinho */
  available: boolean;
}

/** Identidade da linha guardada — é por ela que somamos e removemos. */
function idDe(i: StoredItem): string {
  return cartLineId(i.slug, i.selection ?? {});
}

type Action =
  | { type: "hydrate"; items: StoredItem[] }
  | { type: "add"; slug: string; qty: number; selection: OptionSelection }
  | { type: "setQty"; id: string; qty: number }
  | { type: "remove"; id: string }
  | { type: "clear" };

function reducer(state: StoredItem[], action: Action): StoredItem[] {
  switch (action.type) {
    case "hydrate":
      return action.items;
    case "add": {
      const id = cartLineId(action.slug, action.selection);
      if (state.some((i) => idDe(i) === id)) {
        return state.map((i) =>
          idDe(i) === id ? { ...i, qty: Math.min(i.qty + action.qty, 99) } : i,
        );
      }
      return [
        ...state,
        {
          slug: action.slug,
          qty: Math.min(action.qty, 99),
          selection: action.selection,
        },
      ];
    }
    case "setQty":
      if (action.qty <= 0) return state.filter((i) => idDe(i) !== action.id);
      return state.map((i) =>
        idDe(i) === action.id ? { ...i, qty: Math.min(action.qty, 99) } : i,
      );
    case "remove":
      return state.filter((i) => idDe(i) !== action.id);
    case "clear":
      return [];
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  /** soma das peças disponíveis, antes de cupom e frete */
  subtotal: number;
  /** desconto do cupom aplicado (0 se não houver ou se faltar o mínimo) */
  desconto: number;
  /** subtotal − desconto + frete */
  total: number;
  addItem: (
    slug: string,
    qty?: number,
    selection?: OptionSelection,
  ) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  /** número da loja (wa.me) — null enquanto não configurado */
  whatsappNumber: string | null;
  /** "Pagamento e frete combinados..." — editável no admin */
  orderNote: string;
  /** cupom e frete são compartilhados entre o drawer e a página /carrinho */
  cupom: CupomValido | null;
  setCupom: (cupom: CupomValido | null) => void;
  frete: FreteEscolhido | null;
  setFrete: (frete: FreteEscolhido | null) => void;
  /** há token do Melhor Envio + CEP de origem configurados? */
  freteDisponivel: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

interface CartProviderProps {
  children: React.ReactNode;
  products: Product[];
  whatsappNumber: string | null;
  orderNote: string;
  freteDisponivel: boolean;
}

export function CartProvider({
  children,
  products,
  whatsappNumber,
  orderNote,
  freteDisponivel,
}: CartProviderProps) {
  const [cupom, setCupom] = useState<CupomValido | null>(null);
  const [frete, setFrete] = useState<FreteEscolhido | null>(null);
  const [stored, dispatch] = useReducer(reducer, []);
  const [isOpen, setIsOpen] = useState(false);
  // Pula a primeira execução do efeito de persistência: ela acontece
  // antes de a hidratação ser aplicada e sobrescreveria o carrinho salvo.
  const primeiraPersistencia = useRef(true);

  // Carrega do localStorage após montar (evita mismatch de hidratação)
  useEffect(() => {
    const lerChave = (chave: string): StoredItem[] => {
      const raw = window.localStorage.getItem(chave);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(
          (i): i is StoredItem =>
            typeof i === "object" &&
            i !== null &&
            typeof (i as StoredItem).slug === "string" &&
            typeof (i as StoredItem).qty === "number",
        )
        .map((i) => ({
          slug: i.slug,
          qty: i.qty,
          // Aceita só escolhas em formato texto→texto.
          selection:
            i.selection && typeof i.selection === "object"
              ? Object.fromEntries(
                  Object.entries(i.selection).filter(
                    ([, valor]) => typeof valor === "string",
                  ),
                )
              : {},
        }));
    };

    let items: StoredItem[] = [];
    try {
      items = lerChave(STORAGE_KEY);
      // Carrinho montado antes das variações: aproveita em vez de perder.
      if (items.length === 0) items = lerChave(STORAGE_KEY_V1);
    } catch {
      // localStorage indisponível/corrompido — segue com carrinho vazio
    }
    dispatch({ type: "hydrate", items });
  }, []);

  // Persiste a cada mudança do carrinho
  useEffect(() => {
    if (primeiraPersistencia.current) {
      primeiraPersistencia.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // sem localStorage, o carrinho vive só na sessão
    }
  }, [stored]);

  const items = useMemo<CartItem[]>(
    () =>
      stored.flatMap((i) => {
        const product = products.find((p) => p.slug === i.slug);
        if (!product) return []; // produto removido/desativado — descarta
        const selection = i.selection ?? {};
        return [
          {
            id: cartLineId(i.slug, selection),
            product,
            qty: i.qty,
            selection,
            available: product.badge !== "esgotado",
          },
        ];
      }),
    [stored, products],
  );

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const subtotal = useMemo(
    () =>
      items
        .filter((i) => i.available)
        .reduce((s, i) => s + effectivePrice(i.product) * i.qty, 0),
    [items],
  );

  const desconto = useMemo(
    () => (cupom ? calcularDesconto(cupom, subtotal) : 0),
    [cupom, subtotal],
  );
  const total = useMemo(
    () => Math.max(0, subtotal - desconto) + (frete?.price ?? 0),
    [subtotal, desconto, frete],
  );

  const addItem = useCallback(
    (slug: string, qty = 1, selection: OptionSelection = {}) => {
      dispatch({ type: "add", slug, qty, selection });
      setIsOpen(true);
    },
    [],
  );
  const setQty = useCallback(
    (id: string, qty: number) => dispatch({ type: "setQty", id, qty }),
    [],
  );
  const removeItem = useCallback(
    (id: string) => dispatch({ type: "remove", id }),
    [],
  );
  const clear = useCallback(() => {
    dispatch({ type: "clear" });
    setCupom(null);
    setFrete(null);
  }, []);
  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      desconto,
      total,
      addItem,
      setQty,
      removeItem,
      clear,
      isOpen,
      openDrawer,
      closeDrawer,
      whatsappNumber,
      orderNote,
      cupom,
      setCupom,
      frete,
      setFrete,
      freteDisponivel,
    }),
    [items, count, subtotal, desconto, total, addItem, setQty, removeItem, clear, isOpen, openDrawer, closeDrawer, whatsappNumber, orderNote, cupom, frete, freteDisponivel],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
