import axios from "axios";
import { api } from "./api";

let onUnauthorized: (() => void) | null = null;
let onForbidden: ((msg: string) => void) | null = null;

export function configureAuthHandlers(handlers: {
  onUnauthorized?: () => void;
  onForbidden?: (msg: string) => void;
}): void {
  if (handlers.onUnauthorized) {
    onUnauthorized = handlers.onUnauthorized;
  }
  if (handlers.onForbidden) {
    onForbidden = handlers.onForbidden;
  }
}

let interceptorsRegistered = false;

export function setupInterceptors(): void {
  if (interceptorsRegistered) return;
  interceptorsRegistered = true;

  api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const url: string = error.config?.url || "";
        const esEndpointAuth =
          url.includes("/api/v1/auth/token") ||
          url.includes("/api/v1/auth/me") ||
          url.endsWith("/auth/token") ||
          url.endsWith("/auth/me");

        if (status === 401 && !esEndpointAuth) {
          onUnauthorized?.();
        } else if (status === 403) {
          onForbidden?.("Acceso denegado: no tenés permisos para esta acción.");
        }
      }
      return Promise.reject(error);
    }
  );
}
