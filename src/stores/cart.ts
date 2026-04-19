import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  variantId: string;
  productId: string;
  productSlug: string;
  name: string;
  size: string | null;
  color: string | null;
  image: string | null;
  unitPrice: number;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (line: CartLine) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  subtotal: () => number;
  itemCount: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),

      add: (line) =>
        set((s) => {
          const existing = s.lines.find((l) => l.variantId === line.variantId);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.variantId === line.variantId
                  ? { ...l, quantity: l.quantity + line.quantity }
                  : l
              ),
              isOpen: true,
            };
          }
          return { lines: [...s.lines, line], isOpen: true };
        }),

      setQuantity: (variantId, quantity) =>
        set((s) => ({
          lines:
            quantity <= 0
              ? s.lines.filter((l) => l.variantId !== variantId)
              : s.lines.map((l) =>
                  l.variantId === variantId ? { ...l, quantity } : l
                ),
        })),

      remove: (variantId) =>
        set((s) => ({
          lines: s.lines.filter((l) => l.variantId !== variantId),
        })),

      clear: () => set({ lines: [] }),

      subtotal: () =>
        get().lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),

      itemCount: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    }),
    {
      name: "modaralist-cart",
      partialize: (s) => ({ lines: s.lines }),
    }
  )
);
