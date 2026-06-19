import { create } from "zustand";
import type { User } from "@/types";
import * as api from "@/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: !!localStorage.getItem("access_token"),

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.login(username, password);
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      const me = await api.getMe();
      set({ user: me.data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) {
      await api.logout(refresh).catch(() => {});
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    if (!localStorage.getItem("access_token")) return;
    try {
      const { data } = await api.getMe();
      set({ user: data, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
