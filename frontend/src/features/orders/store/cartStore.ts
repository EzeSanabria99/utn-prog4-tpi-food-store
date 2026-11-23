import { create } from "zustand";
import type { ItemCarrito } from "../types/order.types";

interface CartState {
  items: ItemCarrito[];
  addItem: (item: Omit<ItemCarrito, "cantidad">, cantidad?: number) => void;
  updateCantidad: (productoId: number, cantidad: number) => void;
  removeItem: (productoId: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],

  addItem: (item, cantidad = 1) =>
    set((state) => {
      const existente = state.items.find((i) => i.producto_id === item.producto_id);
      if (existente) {
        const nuevaCant = Math.min(item.stock, existente.cantidad + cantidad);
        return {
          items: state.items.map((i) =>
            i.producto_id === item.producto_id
              ? { ...i, cantidad: Math.max(1, nuevaCant), stock: item.stock }
              : i
          ),
        };
      }
      const cantInicial = Math.min(item.stock, Math.max(1, cantidad));
      if (cantInicial <= 0) return state;
      return {
        items: [...state.items, { ...item, cantidad: cantInicial }],
      };
    }),

  updateCantidad: (productoId, cantidad) =>
    set((state) => ({
      items: state.items
        .map((i) => {
          if (i.producto_id !== productoId) return i;
          if (cantidad <= 0) return null;
          return { ...i, cantidad: Math.min(i.stock, cantidad) };
        })
        .filter((i): i is ItemCarrito => i !== null),
    })),

  removeItem: (productoId) =>
    set((state) => ({
      items: state.items.filter((i) => i.producto_id !== productoId),
    })),

  clearCart: () => set({ items: [] }),
}));
