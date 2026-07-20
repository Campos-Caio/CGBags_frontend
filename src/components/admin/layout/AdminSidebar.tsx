"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_NAV_GROUPS } from "@/constants/adminNav";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col gap-6 border-r border-border bg-background p-6">
      <Link href="/admin" className="font-heading text-xl font-semibold text-primary">
        CG Bags Admin
      </Link>

      <nav className="flex flex-col gap-4">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <p className="px-3 text-[0.68rem] font-semibold tracking-wide text-muted-foreground/70 uppercase">
              {group.label}
            </p>
            {group.links.map((link) => {
              // "/admin" e' prefixo de toda rota do painel — so' o dashboard usa
              // match exato, senao' ele ficaria sempre destacado junto com a
              // tela atual.
              const isActive =
                link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);

              return link.enabled ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-r-lg border-l-2 border-transparent px-[calc(0.75rem-2px)] py-2 text-sm font-medium text-primary/80 transition-colors hover:bg-muted hover:text-primary",
                    isActive && "border-l-primary bg-muted font-semibold text-primary"
                  )}
                >
                  {link.label}
                </Link>
              ) : (
                <span
                  key={link.href}
                  className="flex items-center justify-between rounded-r-lg border-l-2 border-transparent px-[calc(0.75rem-2px)] py-2 text-sm font-medium text-muted-foreground/60"
                >
                  {link.label}
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
                    em breve
                  </span>
                </span>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
