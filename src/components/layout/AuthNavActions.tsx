"use client";

import Link from "next/link";
import { User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

function AuthNavActions() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <>
        <Button variant="ghost" size="icon-lg" aria-label="Meu perfil" asChild>
          <Link href="/account">
            <User className="size-5" />
          </Link>
        </Button>
        <Button variant="outline" size="default" onClick={logout}>
          Sair
        </Button>
      </>
    );
  }

  return (
    <Button variant="outline" size="default" asChild>
      <Link href="/login">Entrar</Link>
    </Button>
  );
}

export { AuthNavActions };
