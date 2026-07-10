import axios from "axios";

import { api } from "@/lib/api";
import type {
  Product,
  ProductAdminInput,
  ProductAdminUpdateInput,
  ProductImage,
  ProductImageInput,
} from "@/types/product";

interface ListProductsParams {
  limit?: number;
  category_id?: number;
}

export async function listProducts(params?: ListProductsParams): Promise<Product[]> {
  const response = await api.get<Product[]>("/products/", { params });

  return response.data;
}

export async function getProductById(id: number): Promise<Product | null> {
  try {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

// --- Rotas administrativas ---

export interface ListProductsAdminParams {
  category_id?: number;
  is_active?: boolean;
  search?: string;
  skip?: number;
  limit?: number;
}

export async function listProductsAdmin(params?: ListProductsAdminParams): Promise<Product[]> {
  const response = await api.get<Product[]>("/products/admin/list", { params });
  return response.data;
}

export async function getProductByIdAdmin(id: number): Promise<Product | null> {
  try {
    const response = await api.get<Product>(`/products/admin/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createProduct(data: ProductAdminInput): Promise<Product> {
  const response = await api.post<Product>("/products/", data);
  return response.data;
}

export async function updateProduct(
  id: number,
  data: ProductAdminUpdateInput
): Promise<Product> {
  const response = await api.patch<Product>(`/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function addProductImage(
  productId: number,
  data: ProductImageInput
): Promise<ProductImage> {
  const response = await api.post<ProductImage>(`/products/${productId}/images`, data);
  return response.data;
}

export async function deleteProductImage(productId: number, imageId: number): Promise<void> {
  await api.delete(`/products/${productId}/images/${imageId}`);
}
