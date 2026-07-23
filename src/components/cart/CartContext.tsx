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
import { effectivePrice, type Product } from "@/lib/types";
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

const STORAGE_KEY = "gabi-bijus-carrinho-v1";

interface StoredItem {
  slug: string;
  qty: number;
}

export interface CartItem {
  product: Product;
  qty: number;
  /** false quando o produto foi esgotado/desativado após entrar no carrinho */
  available: boolean;
}

type Action =
  | { type: "hydrate"; items: StoredItem[] }
  | { type: "add"; slug: string; qty: number }
  | { type: "setQty"; slug: string; qty: number }
  | { type: "remove"; slug: string }
  | { type: "clear" };

function reducer(state: StoredItem[], action: Action): StoredItem[] {
  switch (action.type) {
    case "hydrate":
      return action.items;
    case "add": {
      const existing = state.find((i) => i.slug === action.slug);
      if (existing) {
        return state.map((i) =>
          i.slug === action.slug ? { ...i, qty: Math.min(i.qty + action.qty, 99) } : i,
        );
      }
      return [...state, { slug: action.slug, qty: Math.min(action.qty, 99) }];
    }
    case "setQty":
      if (action.qty <= 0) return state.filter((i) => i.slug !== action.slug);
      return state.map((i) =>
        i.slug === action.slug ? { ...i, qty: Math.min(action.qty, 99) } : i,
      );
    case "remove":
      return state.filter((i) => i.slug !== action.slug);
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
  addItem: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  removeItem: (slug: string) => void;
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
    let items: StoredItem[] = [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          items = parsed.filter(
            (i): i is StoredItem =>
              typeof i === "object" &&
              i !== null &&
              typeof (i as StoredItem).slug === "string" &&
              typeof (i as StoredItem).qty === "number",
          );
        }
      }
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
        return [{ product, qty: i.qty, available: product.badge !== "esgotado" }];
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

  const addItem = useCallback((slug: string, qty = 1) => {
    dispatch({ type: "add", slug, qty });
    setIsOpen(true);
  }, []);
  const setQty = useCallback(
    (slug: string, qty: number) => dispatch({ type: "setQty", slug, qty }),
    [],
  );
  const removeItem = useCallback(
    (slug: string) => dispatch({ type: "remove", slug }),
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
