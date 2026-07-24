import type { OrderTracking } from "@/types/tracking";

// Espelha RETURN_WINDOW_DAYS do backend (ReturnService) — Art. 49 CDC: 7 dias
// corridos a partir do recebimento do produto.
export const RETURN_WINDOW_DAYS = 7;

/**
 * Data de entrega para fins do prazo de arrependimento — o ULTIMO evento
 * "order.delivered" da lista (nao o primeiro), mesmo criterio do backend:
 * um pedido com mais de um pacote so' esta' de fato "recebido" quando TODOS
 * chegaram. Os eventos vem ordenados por occurred_at (mais antigo primeiro).
 */
export function getDeliveredAt(tracking: OrderTracking | null): Date | null {
  if (!tracking) return null;
  const deliveredEvents = tracking.events.filter((e) => e.event === "order.delivered");
  if (deliveredEvents.length === 0) return null;
  return new Date(deliveredEvents[deliveredEvents.length - 1].occurred_at);
}

export function getReturnDeadline(deliveredAt: Date): Date {
  const deadline = new Date(deliveredAt);
  deadline.setDate(deadline.getDate() + RETURN_WINDOW_DAYS);
  return deadline;
}

export function isWithinReturnWindow(deliveredAt: Date, now: Date = new Date()): boolean {
  return now <= getReturnDeadline(deliveredAt);
}
