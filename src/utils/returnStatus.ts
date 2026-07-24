import type { BadgeVariant } from "@/components/ui/badge";
import type { ReturnStatus } from "@/types/orderReturn";

export const RETURN_STATUS_LABEL: Record<ReturnStatus, string> = {
  REQUESTED: "Devolução solicitada",
  AWAITING_PICKUP: "Aguardando postagem nos Correios",
  MANUAL_REQUIRED: "Nossa equipe vai entrar em contato para combinar a coleta",
  RECEIVED: "Produto recebido de volta",
};

export const RETURN_STATUS_BADGE_VARIANT: Record<ReturnStatus, BadgeVariant> = {
  REQUESTED: "warning",
  AWAITING_PICKUP: "info",
  MANUAL_REQUIRED: "warning",
  RECEIVED: "muted",
};
