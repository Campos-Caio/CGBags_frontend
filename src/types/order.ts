export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_FAILED"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED"
  | "RETURN_REQUESTED"
  | "RETURNED";

export interface OrderItem {
  id: number;
  product_id: number;
  variant_id: number;
  product_name: string;
  variant_label: string | null;
  sku: string;
  unit_price: string;
  quantity: number;
  total_price: string;
  created_at: string;
}

export interface Order {
  id: number;
  customer_id: number;
  address_id: number;

  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_document: string;

  shipping_zip_code: string;
  shipping_street: string;
  shipping_number: string;
  shipping_complement: string | null;
  shipping_neighborhood: string;
  shipping_city: string;
  shipping_state: string;
  shipping_method: string | null;

  subtotal: string;
  shipping_cost: string;
  discount: string;
  coupon_code: string | null;
  total: string;

  status: OrderStatus;
  items: OrderItem[];

  created_at: string;
  updated_at: string;
}
