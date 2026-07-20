import Link from "next/link";

import { Button } from "@/components/ui/button";

type EmptyStateAction = { label: string } & ({ href: string; onClick?: never } | { onClick: () => void; href?: never });

interface EmptyStateProps {
  message: string;
  action?: EmptyStateAction;
}

/** Substitui os parágrafos "Nenhum X encontrado" repetidos em toda tabela do admin — com CTA opcional. */
export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {action && action.href ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : action ? (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
