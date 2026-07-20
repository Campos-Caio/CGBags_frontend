"use client";

import Link from "next/link";
import { Home, LogOut } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

/** Barra superior do painel admin — ações de saída do painel (loja / logout), sempre visíveis. */
export function AdminHeader() {
  const { logout } = useAuth();

  return (
    <header className="flex items-center justify-end gap-2 border-b border-border bg-background px-8 py-3">
      <Link
        href="/"
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-primary/80 transition-colors hover:bg-muted hover:text-primary"
      >
        <Home className="size-4" aria-hidden />
        Voltar para a loja
      </Link>

      <button
        type="button"
        onClick={() => logout()}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-primary/80 transition-colors hover:bg-muted hover:text-primary"
      >
        <LogOut className="size-4" aria-hidden />
        Sair
      </button>
    </header>
  );
}
