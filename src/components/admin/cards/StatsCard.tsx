import Link from "next/link";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardSeverity = "neutral" | "attention" | "critical";

interface StatsCardProps {
  label: string;
  value: ReactNode;
  href?: string;
  /**
   * "attention" = precisa de acompanhamento (ex.: estoque baixo).
   * "critical" = trava receita/operação e pede ação agora (ex.: pedidos aguardando pagamento).
   */
  severity?: StatsCardSeverity;
}

const CARD_BY_SEVERITY: Record<StatsCardSeverity, string> = {
  neutral: "",
  attention: "ring-2 ring-accent",
  critical: "bg-accent ring-1 ring-accent",
};

const TEXT_BY_SEVERITY: Record<StatsCardSeverity, string> = {
  neutral: "text-muted-foreground",
  attention: "text-accent-foreground",
  critical: "text-accent-foreground",
};

const VALUE_BY_SEVERITY: Record<StatsCardSeverity, string> = {
  neutral: "text-foreground",
  attention: "text-accent-foreground",
  critical: "text-accent-foreground",
};

/** Card de estatística do Dashboard — label + valor grande, com link opcional e 3 níveis de severidade. */
export function StatsCard({ label, value, href, severity = "neutral" }: StatsCardProps) {
  const isEmphasized = severity !== "neutral";

  const card = (
    <Card
      className={cn(
        CARD_BY_SEVERITY[severity],
        href && (isEmphasized ? "transition-opacity hover:opacity-90" : "transition-colors hover:bg-muted/40")
      )}
    >
      <CardContent
        className={cn(
          "flex flex-col gap-1",
          isEmphasized && "flex-row items-baseline justify-between gap-4"
        )}
      >
        <span className={cn(isEmphasized ? "text-sm" : "text-xs", TEXT_BY_SEVERITY[severity])}>
          {label}
        </span>
        <span
          className={cn(
            "font-heading font-semibold tabular-nums",
            isEmphasized ? "text-2xl" : "text-xl",
            VALUE_BY_SEVERITY[severity]
          )}
        >
          {value}
        </span>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}
