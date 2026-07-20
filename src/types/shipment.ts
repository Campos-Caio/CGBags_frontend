export type ShipmentStatus =
  | "AWAITING_PURCHASE"
  | "CART_INSERTED"
  | "LABEL_PAID"
  | "LABEL_GENERATED"
  | "POSTED"
  | "RECEIVED"
  | "DELIVERED"
  | "UNDELIVERED"
  | "CANCELED"
  | "PURCHASE_FAILED"
  | "SUPERSEDED";

export interface ShipmentEvent {
  event: string;
  label: string;
  occurred_at: string;
}

export interface Shipment {
  id: number;
  order_id: number;
  status: ShipmentStatus;
  melhor_envio_id: string | null;
  protocol: string | null;
  tracking_code: string | null;
  carrier_name: string | null;
  label_url: string | null;
  failure_reason: string | null;
  cart_inserted_at: string | null;
  purchased_at: string | null;
  generated_at: string | null;
  posted_at: string | null;
  delivered_at: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
  events: ShipmentEvent[];
}
