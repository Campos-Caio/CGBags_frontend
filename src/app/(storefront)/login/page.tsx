"use client";

import { useState, type FormEvent, type SVGProps } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import * as authService from "@/services/auth.service";
import { getApiErrorMessage } from "@/utils/apiError";

const GOOGLE_OAUTH_STATE_KEY = "google_oauth_state";

function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.48a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.96-2.91l-3.88-3c-1.08.72-2.46 1.15-4.08 1.15-3.13 0-5.79-2.11-6.74-4.96H1.26v3.1A11.998 11.998 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.26 14.28A7.2 7.2 0 0 1 4.88 12c0-.79.14-1.56.38-2.28v-3.1H1.26A11.998 11.998 0 0 0 0 12c0 1.94.46 3.77 1.26 5.38l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.62l4 3.1C6.21 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      toast.success("Login realizado com sucesso.");
      router.push("/");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível entrar. Verifique seus dados."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);

    try {
      const redirectUri = `${window.location.origin}/login/google/callback`;
      const { url, state } = await authService.getGoogleAuthUrl(redirectUri);
      sessionStorage.setItem(GOOGLE_OAUTH_STATE_KEY, state);
      window.location.href = url;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível iniciar o login com Google."));
      setIsGoogleLoading(false);
    }
  }

  return (
    <Container className="flex justify-center py-16 sm:py-24">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Entrar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acesse sua conta para ver seu carrinho e seus pedidos.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Senha
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={showPassword}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={isGoogleLoading}
          onClick={handleGoogleLogin}
          className="mt-6 w-full"
        >
          <GoogleIcon className="size-4" />
          {isGoogleLoading ? "Redirecionando..." : "Entrar com Google"}
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link href="/register" className="font-medium text-foreground hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </Container>
  );
}
