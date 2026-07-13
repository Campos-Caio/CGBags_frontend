import type { StockMovementType } from "@/types/stock";

export const STOCK_MOVEMENT_TYPE_LABEL: Record<StockMovementType, string> = {
  PURCHASE: "Compra",
  SALE: "Venda",
  ADJUSTMENT: "Ajuste",
  RETURN: "Devolução",
  INITIAL_LOAD: "Carga inicial",
};

export const STOCK_MOVEMENT_TYPE_BADGE_CLASS: Record<StockMovementType, string> = {
  PURCHASE: "bg-green-100 text-green-800",
  RETURN: "bg-green-100 text-green-800",
  INITIAL_LOAD: "bg-green-100 text-green-800",
  SALE: "bg-amber-100 text-amber-800",
  ADJUSTMENT: "bg-blue-100 text-blue-800",
};

export function isStockEntry(type: StockMovementType): boolean {
  return type === "PURCHASE" || type === "RETURN" || type === "INITIAL_LOAD";
}
