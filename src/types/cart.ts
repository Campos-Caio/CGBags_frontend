export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export interface Cart {
  id: number;
  customer_id: number;
  items: CartItem[];
  total: string;
}
