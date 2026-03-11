import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  dark: boolean;
  toggleTheme: () => void;
  setDark: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      dark: true,
      toggleTheme: () => set((s) => ({ dark: !s.dark })),
      setDark: (dark) => set({ dark }),
    }),
    { name: "dashflow-theme" }
  )
);
