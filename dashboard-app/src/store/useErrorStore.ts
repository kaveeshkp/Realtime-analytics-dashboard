import { create } from 'zustand';

export interface AppError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'success' | 'info';
  timestamp: number;
  duration?: number; // Auto-dismiss after duration (ms)
}

interface ErrorStore {
  errors: AppError[];
  addError: (message: string, type?: 'error' | 'warning' | 'success' | 'info', duration?: number) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

export const useErrorStore = create<ErrorStore>((set) => ({
  errors: [],

  addError: (message: string, type = 'error', duration = 5000) => {
    const id = `${Date.now()}-${Math.random()}`;

    set((state) => ({
      errors: [
        ...state.errors,
        {
          id,
          message,
          type,
          timestamp: Date.now(),
          duration,
        },
      ],
    }));

    // Auto-remove after duration if specified
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          errors: state.errors.filter((e) => e.id !== id),
        }));
      }, duration);
    }
  },

  removeError: (id: string) => {
    set((state) => ({
      errors: state.errors.filter((e) => e.id !== id),
    }));
  },

  clearErrors: () => {
    set({ errors: [] });
  },
}));
