"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Container } from "@/components/ui/container";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/utils/apiError";

const GOOGLE_OAUTH_STATE_KEY = "google_oauth_state";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Evita rodar duas vezes em StrictMode/dev, o que trocaria o mesmo
  // `code` de novo e falharia (codigo de autorizacao do Google e' uso unico).
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    async function completeLogin() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const oauthError = params.get("error");
      const expectedState = sessionStorage.getItem(GOOGLE_OAUTH_STATE_KEY);
      sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);

      if (oauthError || !code || !state || state !== expectedState) {
        setErrorMessage("Não foi possível concluir o login com Google.");
        toast.error("Não foi possível concluir o login com Google.");
        router.replace("/login");
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/login/google/callback`;
        await loginWithGoogle(code, redirectUri);
        toast.success("Login realizado com sucesso.");
        router.replace("/");
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Não foi possível entrar com Google."));
        toast.error(getApiErrorMessage(error, "Não foi possível entrar com Google."));
        router.replace("/login");
      }
    }

    completeLogin();
  }, [router, loginWithGoogle]);

  return (
    <Container className="flex justify-center py-24">
      <p className="text-sm text-muted-foreground">
        {errorMessage ?? "Concluindo login com Google..."}
      </p>
    </Container>
  );
}
