import { api } from "@/lib/api";
import type {
  StockAddInput,
  StockAdjustInput,
  StockMovement,
  StockMovementType,
  StockRemoveInput,
} from "@/types/stock";
import type { Product } from "@/types/product";

export interface ListMovementsParams {
  product_id?: number;
  movement_type?: StockMovementType;
  skip?: number;
  limit?: number;
}

export async function listMovements(params?: ListMovementsParams): Promise<StockMovement[]> {
  const response = await api.get<StockMovement[]>("/stock/movements", { params });
  return response.data;
}

export async function getLowStockProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>("/stock/low-stock");
  return response.data;
}

export async function addStock(productId: number, data: StockAddInput): Promise<StockMovement> {
  const response = await api.post<StockMovement>(`/products/${productId}/stock/add`, data);
  return response.data;
}

export async function removeStock(
  productId: number,
  data: StockRemoveInput
): Promise<StockMovement> {
  const response = await api.post<StockMovement>(`/products/${productId}/stock/remove`, data);
  return response.data;
}

export async function adjustStock(
  productId: number,
  data: StockAdjustInput
): Promise<StockMovement> {
  const response = await api.post<StockMovement>(`/products/${productId}/stock/adjust`, data);
  return response.data;
}
