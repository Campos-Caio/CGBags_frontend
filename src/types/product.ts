export interface ProductImage {
  id: number;
  product_id: number;
  image_key: string;
  image_url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  label: string | null;
  sku: string;
  price: string | null;
  stock_quantity: number;
  stock_minimum: number;
  weight: string | null;
  width: string | null;
  height: string | null;
  length: string | null;
  meters: string | null;
  is_custom: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  vehicle_model: string | null;
  is_active: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductAdminInput {
  category_id: number;
  name: string;
  slug?: string;
  description?: string;
  vehicle_model?: string;
  is_active: boolean;
  // Campos da variante padrao, criada junto com o produto.
  sku: string;
  price: string;
  stock_minimum: number;
  weight?: string;
  width?: string;
  height?: string;
  length?: string;
  meters?: string;
}

export interface ProductAdminUpdateInput {
  category_id?: number;
  name?: string;
  slug?: string;
  description?: string;
  vehicle_model?: string;
  is_active?: boolean;
}

export interface ProductVariantInput {
  label?: string | null;
  sku: string;
  price?: string | null;
  stock_minimum: number;
  weight?: string | null;
  width?: string | null;
  height?: string | null;
  length?: string | null;
  meters?: string | null;
  is_custom: boolean;
  is_active: boolean;
}

export type ProductVariantUpdateInput = Partial<ProductVariantInput>;
