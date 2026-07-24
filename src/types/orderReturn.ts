export type ReturnStatus = "REQUESTED" | "AWAITING_PICKUP" | "MANUAL_REQUIRED" | "RECEIVED";

export interface OrderReturn {
  id: number;
  order_id: number;
  status: ReturnStatus;
  reason: string | null;
  requested_at: string;
  refunded_amount: string;
  carrier_name: string | null;
  return_code: string | null;
  received_at: string | null;
  created_at: string;
  updated_at: string;
}
