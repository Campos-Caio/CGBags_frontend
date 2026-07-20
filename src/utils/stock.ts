import type { BadgeVariant } from "@/components/ui/badge";

const LOW_STOCK_THRESHOLD = 5;

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export function getStockStatus(stockQuantity: number): StockStatus {
  if (stockQuantity <= 0) return "out-of-stock";
  if (stockQuantity <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  "in-stock": "Em estoque",
  "low-stock": "Últimas unidades",
  "out-of-stock": "Indisponível",
};

export const STOCK_STATUS_BADGE_VARIANT: Record<StockStatus, BadgeVariant> = {
  "in-stock": "success",
  "low-stock": "warning",
  "out-of-stock": "destructive",
};
