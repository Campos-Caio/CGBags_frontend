import { api } from "@/lib/api";
import type {
  StockAddInput,
  StockAdjustInput,
  StockMovement,
  StockMovementType,
  StockRemoveInput,
} from "@/types/stock";
import type { ProductVariant } from "@/types/product";

export interface ListMovementsParams {
  variant_id?: number;
  movement_type?: StockMovementType;
  skip?: number;
  limit?: number;
}

export async function listMovements(params?: ListMovementsParams): Promise<StockMovement[]> {
  const response = await api.get<StockMovement[]>("/stock/movements", { params });
  return response.data;
}

export async function getLowStockVariants(): Promise<ProductVariant[]> {
  const response = await api.get<ProductVariant[]>("/stock/low-stock");
  return response.data;
}

export async function addStock(variantId: number, data: StockAddInput): Promise<StockMovement> {
  const response = await api.post<StockMovement>(`/variants/${variantId}/stock/add`, data);
  return response.data;
}

export async function removeStock(
  variantId: number,
  data: StockRemoveInput
): Promise<StockMovement> {
  const response = await api.post<StockMovement>(`/variants/${variantId}/stock/remove`, data);
  return response.data;
}

export async function adjustStock(
  variantId: number,
  data: StockAdjustInput
): Promise<StockMovement> {
  const response = await api.post<StockMovement>(`/variants/${variantId}/stock/adjust`, data);
  return response.data;
}
