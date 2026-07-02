export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  sort_order: number;
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
  weight: string | null;
  width: string | null;
  height: string | null;
  length: string | null;
  vehicle_model: string | null;
  meters: string | null;
  is_active: boolean;
  images: ProductImage[];
}
