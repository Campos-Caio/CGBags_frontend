"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

import { ADMIN_NAV_LINKS } from "@/constants/adminNav";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="flex w-60 shrink-0 flex-col justify-between border-r border-border bg-background p-6">
      <div className="flex flex-col gap-8">
        <Link href="/admin" className="font-heading text-xl font-semibold text-primary">
          CG Bags Admin
        </Link>

        <nav className="flex flex-col gap-1">
          {ADMIN_NAV_LINKS.map((link) =>
            link.enabled ? (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-primary/80 transition-colors hover:bg-muted hover:text-primary",
                  pathname.startsWith(link.href) && "bg-muted text-primary"
                )}
              >
                {link.label}
              </Link>
            ) : (
              <span
                key={link.href}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/60"
              >
                {link.label}
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
                  em breve
                </span>
              </span>
            )
          )}
        </nav>
      </div>

      <div className="flex flex-col gap-1">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary/80 transition-colors hover:bg-muted hover:text-primary"
        >
          <Home className="size-4" aria-hidden />
          Voltar para a loja
        </Link>

        <button
          type="button"
          onClick={() => logout()}
          className="rounded-lg px-3 py-2 text-left text-sm font-medium text-primary/80 transition-colors hover:bg-muted hover:text-primary"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
