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
