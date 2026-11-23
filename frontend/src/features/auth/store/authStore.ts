import { create } from "zustand";
import { api } from "@/shared/api/api";
import { configureAuthHandlers } from "@/shared/api/setupInterceptors";
import { useNotificationStore } from "@/store/notificationStore";
import type { RegisterPayload, UsuarioAuth } from "../types/auth.types";

interface AuthState {
  user: UsuarioAuth | null;
  checking: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  checking: true,
  isLoading: false,

  clearSession: () => {
    set({ user: null, checking: false, isLoading: false });
  },

  checkAuth: async () => {
    set({ checking: true });
    try {
      const { data } = await api.get<UsuarioAuth>("/api/v1/auth/me");
      set({ user: data, checking: false });
    } catch {
      set({ user: null, checking: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      await api.post("/api/v1/auth/token", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const { data } = await api.get<UsuarioAuth>("/api/v1/auth/me");
      set({ user: data, checking: false, isLoading: false });
    } catch (error) {
      set({ user: null, checking: false, isLoading: false });
      throw error;
    }
  },

  register: async (payload: RegisterPayload) => {
    set({ isLoading: true });
    try {
      await api.post("/api/v1/auth/register", payload);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post("/api/v1/auth/logout");
    } finally {
      set({ user: null, checking: false, isLoading: false });
    }
  },
}));

configureAuthHandlers({
  onUnauthorized: () => {
    useAuthStore.getState().clearSession();
  },
  onForbidden: (msg: string) => {
    useNotificationStore.getState().showNotification(msg, "error");
  },
});
