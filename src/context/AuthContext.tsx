"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { refreshAccessToken, setUnauthorizedHandler } from "@/lib/api";
import { setAccessToken } from "@/lib/token";
import * as authService from "@/services/auth.service";
import type { User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (code: string, redirectUri: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      // So avisa se havia mesmo uma sessao ativa — evita toast espurio no
      // primeiro carregamento de um visitante anonimo (nunca logado nesta
      // aba), quando nao ha nada para "expirar".
      setUser((current) => {
        if (current !== null) {
          toast.error("Sua sessão expirou. Faça login novamente.");
        }
        return null;
      });
    });

    async function restoreSession() {
      // Nao ha access token persistido (fica so em memoria): a sessao e restaurada
      // trocando o refresh token do cookie httpOnly por um novo access token.
      const token = await refreshAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setUser(await authService.getMe());
      } catch {
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const token = await authService.login(email, password);
    setAccessToken(token.access_token);
    setUser(await authService.getMe());
  }, []);

  const loginWithGoogle = useCallback(async (code: string, redirectUri: string) => {
    const token = await authService.googleCallback(code, redirectUri);
    setAccessToken(token.access_token);
    setUser(await authService.getMe());
  }, []);

  const register = useCallback(
    async (email: string, password: string) => {
      await authService.register(email, password);
      await login(email, password);
    },
    [login]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setUser(await authService.getMe());
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
