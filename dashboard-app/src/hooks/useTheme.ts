import { useEffect } from "react";
import { useThemeStore } from "../store/useThemeStore";

/**
 * Thin wrapper around useThemeStore that also syncs the `dark` class on
 * <html> whenever the theme changes.
 */
export function useTheme() {
  const { dark, toggleTheme, setDark } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [dark]);

  return { dark, toggleTheme, setDark };
}
