import type { BadgeVariant } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/order";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Aguardando pagamento",
  PAYMENT_FAILED: "Pagamento recusado",
  PAID: "Pago",
  PROCESSING: "Em preparação",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
};

export const ORDER_STATUS_BADGE_VARIANT: Record<OrderStatus, BadgeVariant> = {
  PENDING_PAYMENT: "accent",
  PAYMENT_FAILED: "destructive",
  PAID: "secondary",
  PROCESSING: "secondary",
  SHIPPED: "secondary",
  DELIVERED: "muted",
  CANCELED: "destructive",
};

/**
 * Relevância para o cliente na tela "Meus pedidos": pedidos que dependem de
 * uma ação (pagar) ou estão em andamento sobem para o topo; finalizados
 * (entregue/cancelado) vão para o fim. Dentro do mesmo grupo, a ordenação
 * por data (mais recente primeiro) já vem do backend.
 */
export const ORDER_STATUS_RELEVANCE_RANK: Record<OrderStatus, number> = {
  PENDING_PAYMENT: 0,
  PAYMENT_FAILED: 0,
  PROCESSING: 1,
  PAID: 1,
  SHIPPED: 1,
  DELIVERED: 2,
  CANCELED: 3,
};
