export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  variant_id: number;
  variant_label: string | null;
  product_sku: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  total: string;
}
