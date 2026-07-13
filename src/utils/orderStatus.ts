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

export const ORDER_STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-accent text-accent-foreground",
  PAYMENT_FAILED: "bg-destructive/10 text-destructive",
  PAID: "bg-secondary text-secondary-foreground",
  PROCESSING: "bg-secondary text-secondary-foreground",
  SHIPPED: "bg-secondary text-secondary-foreground",
  DELIVERED: "bg-muted text-muted-foreground",
  CANCELED: "bg-destructive/10 text-destructive",
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
