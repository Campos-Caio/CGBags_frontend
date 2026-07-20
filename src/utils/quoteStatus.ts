import type { BadgeVariant } from "@/components/ui/badge";
import type { CustomQuoteStatus } from "@/types/quote";

export const QUOTE_STATUS_LABEL: Record<CustomQuoteStatus, string> = {
  PENDING: "Pendente",
  CONTACTED: "Contatado",
  CONVERTED: "Convertido",
  DECLINED: "Recusado",
};

export const QUOTE_STATUS_BADGE_VARIANT: Record<CustomQuoteStatus, BadgeVariant> = {
  PENDING: "accent",
  CONTACTED: "secondary",
  CONVERTED: "secondary",
  DECLINED: "destructive",
};
