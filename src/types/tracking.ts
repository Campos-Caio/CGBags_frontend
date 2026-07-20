export interface OrderTrackingEvent {
  event: string;
  label: string;
  occurred_at: string;
}

export interface OrderTracking {
  order_id: number;
  order_status: string;
  shipment_status: string | null;
  tracking_code: string | null;
  carrier_name: string | null;
  carrier_tracking_url: string | null;
  events: OrderTrackingEvent[];
}
