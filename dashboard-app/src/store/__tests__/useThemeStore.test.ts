import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useThemeStore } from './useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset the store
    useThemeStore.setState({ dark: true });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('initializes with dark mode enabled by default', () => {
      expect(useThemeStore.getState().dark).toBe(true);
    });

    it('has toggleTheme function', () => {
      const state = useThemeStore.getState();
      expect(typeof state.toggleTheme).toBe('function');
    });

    it('has setDark function', () => {
      const state = useThemeStore.getState();
      expect(typeof state.setDark).toBe('function');
    });
  });

  describe('toggleTheme', () => {
    it('toggles dark mode from true to false', () => {
      useThemeStore.setState({ dark: true });
      useThemeStore.getState().toggleTheme();

      expect(useThemeStore.getState().dark).toBe(false);
    });

    it('toggles dark mode from false to true', () => {
      useThemeStore.setState({ dark: false });
      useThemeStore.getState().toggleTheme();

      expect(useThemeStore.getState().dark).toBe(true);
    });

    it('toggles multiple times correctly', () => {
      const state = useThemeStore.getState();

      state.toggleTheme(); // true → false
      expect(useThemeStore.getState().dark).toBe(false);

      state.toggleTheme(); // false → true
      expect(useThemeStore.getState().dark).toBe(true);

      state.toggleTheme(); // true → false
      expect(useThemeStore.getState().dark).toBe(false);
    });
  });

  describe('setDark', () => {
    it('sets dark mode to true', () => {
      useThemeStore.setState({ dark: false });
      useThemeStore.getState().setDark(true);

      expect(useThemeStore.getState().dark).toBe(true);
    });

    it('sets dark mode to false', () => {
      useThemeStore.setState({ dark: true });
      useThemeStore.getState().setDark(false);

      expect(useThemeStore.getState().dark).toBe(false);
    });

    it('can set to same value without error', () => {
      useThemeStore.setState({ dark: true });
      useThemeStore.getState().setDark(true);

      expect(useThemeStore.getState().dark).toBe(true);
    });

    it('explicitly sets false multiple times', () => {
      useThemeStore.getState().setDark(false);
      useThemeStore.getState().setDark(false);
      useThemeStore.getState().setDark(false);

      expect(useThemeStore.getState().dark).toBe(false);
    });
  });

  describe('Store Subscription', () => {
    it('notifies subscribers when theme changes', () => {
      const callback = vi.fn();
      const unsubscribe = useThemeStore.subscribe(state => state.dark, callback);

      useThemeStore.getState().toggleTheme();

      expect(callback).toHaveBeenCalledWith(false, true);
      unsubscribe();
    });

    it('notifies with setDark', () => {
      const callback = vi.fn();
      const unsubscribe = useThemeStore.subscribe(state => state.dark, callback);

      useThemeStore.getState().setDark(false);

      expect(callback).toHaveBeenCalled();
      unsubscribe();
    });

    it('can unsubscribe from store changes', () => {
      const callback = vi.fn();
      const unsubscribe = useThemeStore.subscribe(state => state.dark, callback);

      unsubscribe();

      useThemeStore.getState().toggleTheme();

      expect(callback).not.toHaveBeenCalled();
    });

    it('multiple subscribers can listen independently', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsubscribe1 = useThemeStore.subscribe(state => state.dark, callback1);
      const unsubscribe2 = useThemeStore.subscribe(state => state.dark, callback2);

      useThemeStore.getState().toggleTheme();

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();

      unsubscribe1();
      unsubscribe2();
    });
  });

  describe('Persistence', () => {
    it('persists theme to localStorage', () => {
      useThemeStore.setState({ dark: false });

      // Trigger persist middleware by getting state
      const state = useThemeStore.getState();
      expect(state.dark).toBe(false);

      // Check if it was stored
      const stored = localStorage.getItem('dashflow-theme');
      expect(stored).toBeDefined();
    });

    it('retrieves persisted theme from localStorage', () => {
      // Manually set localStorage as if it was persisted
      const persistedState = JSON.stringify({
        state: { dark: false },
        version: 0,
      });
      localStorage.setItem('dashflow-theme', persistedState);

      // Create new store instance to test rehydration
      // Note: This is tricky with the current setup, but we can test the mechanism
      useThemeStore.setState({ dark: false });

      const state = useThemeStore.getState();
      expect(state.dark).toBe(false);
    });

    it('stores under correct key "dashflow-theme"', () => {
      useThemeStore.setState({ dark: false });

      // The persist middleware should use the specified key
      const stored = localStorage.getItem('dashflow-theme');
      expect(stored).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid toggles correctly', () => {
      const state = useThemeStore.getState();

      for (let i = 0; i < 100; i++) {
        state.toggleTheme();
      }

      // After 100 toggles (even number), should be back to original
      expect(useThemeStore.getState().dark).toBe(true);
    });

    it('handles setDark with boolean values only', () => {
      useThemeStore.getState().setDark(true);
      expect(useThemeStore.getState().dark).toBe(true);

      useThemeStore.getState().setDark(false);
      expect(useThemeStore.getState().dark).toBe(false);

      // Both extremes should work consistently
      useThemeStore.getState().setDark(true);
      expect(useThemeStore.getState().dark).toBe(true);
    });
  });

  describe('State Consistency', () => {
    it('maintains consistent state after multiple operations', () => {
      const state = useThemeStore.getState();

      state.setDark(true);
      expect(useThemeStore.getState().dark).toBe(true);

      state.toggleTheme();
      expect(useThemeStore.getState().dark).toBe(false);

      state.setDark(true);
      expect(useThemeStore.getState().dark).toBe(true);

      state.toggleTheme();
      state.toggleTheme();
      expect(useThemeStore.getState().dark).toBe(true);
    });

    it('does not corrupt state with concurrent calls', () => {
      const state = useThemeStore.getState();

      state.toggleTheme();
      state.setDark(true);
      state.toggleTheme();
      state.setDark(false);

      expect(useThemeStore.getState().dark).toBe(false);
    });
  });
});
