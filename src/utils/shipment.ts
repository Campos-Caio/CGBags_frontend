import type { BadgeVariant } from "@/components/ui/badge";
import type { ShipmentStatus } from "@/types/shipment";

export const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  AWAITING_PURCHASE: "Aguardando compra",
  CART_INSERTED: "Inserido no carrinho",
  LABEL_PAID: "Frete pago",
  LABEL_GENERATED: "Etiqueta gerada",
  POSTED: "Postado",
  RECEIVED: "Em trânsito",
  DELIVERED: "Entregue",
  UNDELIVERED: "Entrega sem sucesso",
  CANCELED: "Cancelado",
  PURCHASE_FAILED: "Falha na compra",
  SUPERSEDED: "Enviado manualmente",
};

export const SHIPMENT_STATUS_BADGE_VARIANT: Record<ShipmentStatus, BadgeVariant> = {
  AWAITING_PURCHASE: "muted",
  CART_INSERTED: "muted",
  LABEL_PAID: "secondary",
  LABEL_GENERATED: "secondary",
  POSTED: "info",
  RECEIVED: "info",
  DELIVERED: "success",
  UNDELIVERED: "warning",
  CANCELED: "destructive",
  PURCHASE_FAILED: "destructive",
  SUPERSEDED: "muted",
};

// SUPERSEDED fica de fora de proposito: o frete pode ainda existir (e ser
// cancelavel) do lado do Melhor Envio mesmo depois do pedido ter sido
// avancado manualmente — ver ShipmentService.mark_superseded_by_manual_shipment.
const TERMINAL_SHIPMENT_STATUSES: ShipmentStatus[] = ["CANCELED", "DELIVERED"];

export function isShipmentTerminal(status: ShipmentStatus): boolean {
  return TERMINAL_SHIPMENT_STATUSES.includes(status);
}

/** Link publico e fixo do Melhor Envio — nao depende de qual transportadora entregou. */
export function getCarrierTrackingUrl(trackingCode: string | null): string | null {
  return trackingCode ? `https://www.melhorrastreio.com.br/rastreio/${trackingCode}` : null;
}
