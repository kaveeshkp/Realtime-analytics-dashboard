import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WatchlistItem } from "../types/stock.types";

interface WatchlistState {
  items: WatchlistItem[];
  addItem: (item: Omit<WatchlistItem, "id" | "addedAt">) => void;
  removeItem: (symbol: string, type: WatchlistItem["type"]) => void;
  clearWatchlist: () => void;
  isInWatchlist: (symbol: string, type: WatchlistItem["type"]) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((s) => ({
          items: [
            ...s.items,
            { ...item, id: `${item.type}-${item.symbol}`, addedAt: Date.now() },
          ],
        })),

      removeItem: (symbol, type) =>
        set((s) => ({
          items: s.items.filter(
            (i) => !(i.symbol === symbol && i.type === type)
          ),
        })),

      clearWatchlist: () => set({ items: [] }),

      isInWatchlist: (symbol, type) =>
        get().items.some((i) => i.symbol === symbol && i.type === type),
    }),
    { name: "dashflow-watchlist" }
  )
);
