"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { confirmLeaveWithUnsavedChanges } from "@/utils/confirmToast";

interface AdminDetailHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  backHref: string;
  backLabel: string;
  meta?: ReactNode;
  actions?: ReactNode;
  /** Quando true, sair pelo botão de voltar pede confirmação (salvar/descartar) antes de navegar. */
  isDirty?: boolean;
  /** Deve salvar e retornar se deu certo. Só é chamado quando isDirty=true e o usuário escolhe salvar. */
  onSaveAndLeave?: () => Promise<boolean>;
}

export function AdminDetailHeader({
  title,
  subtitle,
  backHref,
  backLabel,
  meta,
  actions,
  isDirty = false,
  onSaveAndLeave,
}: AdminDetailHeaderProps) {
  const router = useRouter();

  function handleBackClick(event: React.MouseEvent) {
    if (!isDirty) return;
    event.preventDefault();
    confirmLeaveWithUnsavedChanges(
      async () => {
        const saved = await onSaveAndLeave?.();
        if (saved) router.push(backHref);
      },
      () => router.push(backHref)
    );
  }

  return (
    <div className="sticky top-0 z-10 -mx-8 -mt-8 mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border bg-background px-8 py-4 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={backHref}
          onClick={handleBackClick}
          aria-label={backLabel}
          title={backLabel}
          className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate font-heading text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {meta}
        {actions}
      </div>
    </div>
  );
}
