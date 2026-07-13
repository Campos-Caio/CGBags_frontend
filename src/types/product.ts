export interface ProductImage {
  id: number;
  product_id: number;
  image_key: string;
  image_url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  stock_quantity: number;
  stock_minimum: number;
  weight: string | null;
  width: string | null;
  height: string | null;
  length: string | null;
  vehicle_model: string | null;
  meters: string | null;
  is_active: boolean;
  images: ProductImage[];
}

export interface ProductAdminInput {
  category_id: number;
  sku: string;
  name: string;
  slug?: string;
  description?: string;
  price: string;
  stock_minimum: number;
  weight?: string;
  width?: string;
  height?: string;
  length?: string;
  vehicle_model?: string;
  meters?: string;
  is_active: boolean;
}

export type ProductAdminUpdateInput = Partial<ProductAdminInput>;
