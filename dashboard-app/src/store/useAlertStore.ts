import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AlertCondition = "above" | "below";

export interface PriceAlert {
  id: string;
  symbol: string;
  name: string;
  condition: AlertCondition;
  targetPrice: number;
  currentPrice: number;
  triggered: boolean;
  createdAt: number;
  triggeredAt?: number;
}

interface AlertState {
  alerts: PriceAlert[];
  addAlert: (alert: Omit<PriceAlert, "id" | "triggered" | "createdAt">) => void;
  removeAlert: (id: string) => void;
  triggerAlert: (id: string, currentPrice: number) => void;
  checkAlerts: (symbol: string, price: number) => string[];
  clearTriggered: () => void;
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      alerts: [],

      addAlert: (alert) =>
        set((s) => ({
          alerts: [
            ...s.alerts,
            { ...alert, id: crypto.randomUUID(), triggered: false, createdAt: Date.now() },
          ],
        })),

      removeAlert: (id) =>
        set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),

      triggerAlert: (id, currentPrice) =>
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === id
              ? { ...a, triggered: true, currentPrice, triggeredAt: Date.now() }
              : a
          ),
        })),

      /** Returns ids of newly triggered alerts */
      checkAlerts: (symbol, price) => {
        const triggered: string[] = [];
        get().alerts.forEach((a) => {
          if (a.triggered || a.symbol !== symbol) return;
          const hit =
            (a.condition === "above" && price >= a.targetPrice) ||
            (a.condition === "below" && price <= a.targetPrice);
          if (hit) triggered.push(a.id);
        });
        if (triggered.length > 0) {
          set((s) => ({
            alerts: s.alerts.map((a) =>
              triggered.includes(a.id)
                ? { ...a, triggered: true, currentPrice: price, triggeredAt: Date.now() }
                : a
            ),
          }));
        }
        return triggered;
      },

      clearTriggered: () =>
        set((s) => ({ alerts: s.alerts.filter((a) => !a.triggered) })),
    }),
    { name: "dashflow-alerts" }
  )
);
