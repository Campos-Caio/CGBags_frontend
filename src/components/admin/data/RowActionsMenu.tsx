import Link from "next/link";
import { MoreHorizontal, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface RowAction {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

interface RowActionsMenuProps {
  actions: RowAction[];
  /** Rótulo do gatilho "⋯" — vira tooltip e aria-label. */
  label?: string;
}

/**
 * Menu "⋯" de ações de linha de tabela — Tooltip + DropdownMenu com um
 * separador automático antes da primeira ação destrutiva. Antes desta
 * extração, ProductsTable/CustomersTable/UsersTable/CouponsTable
 * remontavam este mesmo bloco cada uma na sua propria tabela.
 */
export function RowActionsMenu({ actions, label = "Ações" }: RowActionsMenuProps) {
  const firstDestructiveIndex = actions.findIndex((action) => action.variant === "destructive");

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" aria-label={label}>
                <MoreHorizontal className="size-3.5" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent>
          {actions.map((action, index) => (
            <RowActionItem
              key={action.label}
              action={action}
              showSeparatorBefore={index === firstDestructiveIndex && index > 0}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function RowActionItem({
  action,
  showSeparatorBefore,
}: {
  action: RowAction;
  showSeparatorBefore: boolean;
}) {
  const Icon = action.icon;
  const content = (
    <>
      <Icon className="size-4" aria-hidden />
      {action.label}
    </>
  );

  return (
    <>
      {showSeparatorBefore && <DropdownMenuSeparator />}
      {action.href ? (
        <DropdownMenuItem asChild variant={action.variant} disabled={action.disabled}>
          <Link href={action.href}>{content}</Link>
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem variant={action.variant} disabled={action.disabled} onSelect={action.onClick}>
          {content}
        </DropdownMenuItem>
      )}
    </>
  );
}
