import axios from "axios";

import { api } from "@/lib/api";
import type { Product } from "@/types/product";

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
