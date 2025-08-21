import { create } from 'zustand';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  user: any | null;
  isLoading: boolean;
}

interface AppActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setUser: (user: any) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export const useAppStore = create<AppState & AppActions>((set) => ({
  // State
  theme: 'system',
  user: null,
  isLoading: false,

  // Actions
  setTheme: (theme) => set({ theme }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  clearUser: () => set({ user: null }),
}));
