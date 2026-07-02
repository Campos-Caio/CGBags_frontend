import axios, { type InternalAxiosRequestConfig } from "axios";

import { getAccessToken, setAccessToken } from "@/lib/token";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

// Usa uma instância crua do axios (sem os interceptors de `api`) para o refresh:
// se passasse por `api`, um 401 aqui reentraria neste mesmo interceptor de resposta
// e ficaria esperando por `refreshPromise` — que é exatamente esta chamada em andamento.
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await axios.post<{ access_token: string }>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      undefined,
      { withCredentials: true }
    );
    setAccessToken(response.data.access_token);
    return response.data.access_token;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      if (newAccessToken) {
        originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
        return api(originalRequest);
      }

      setAccessToken(null);
      onUnauthorized?.();
    }

    return Promise.reject(error);
  }
);
