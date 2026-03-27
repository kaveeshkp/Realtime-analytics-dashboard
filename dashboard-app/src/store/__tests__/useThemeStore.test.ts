import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore } from "../useThemeStore";

describe("useThemeStore", () => {
  beforeEach(() => {
    useThemeStore.setState({ dark: true });
    localStorage.clear();
  });

  it("defaults to dark mode", () => {
    expect(useThemeStore.getState().dark).toBe(true);
  });

  it("toggleTheme flips dark state", () => {
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().dark).toBe(false);
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().dark).toBe(true);
  });

  it("setDark explicitly sets state", () => {
    useThemeStore.getState().setDark(false);
    expect(useThemeStore.getState().dark).toBe(false);
    useThemeStore.getState().setDark(true);
    expect(useThemeStore.getState().dark).toBe(true);
  });
});
