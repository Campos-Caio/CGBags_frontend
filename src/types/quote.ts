export type CustomQuoteStatus = "PENDING" | "CONTACTED" | "CONVERTED" | "DECLINED";

export interface CustomQuoteRequest {
  id: number;
  customer_id: number;
  product_id: number;
  variant_id: number;
  details: string;
  status: CustomQuoteStatus;
  order_id: number | null;
  created_at: string;
  updated_at: string;
}
