import type { BadgeVariant } from "@/components/ui/badge";
import type { StockMovementType } from "@/types/stock";

export const STOCK_MOVEMENT_TYPE_LABEL: Record<StockMovementType, string> = {
  PURCHASE: "Compra",
  SALE: "Venda",
  ADJUSTMENT: "Ajuste",
  RETURN: "Devolução",
  INITIAL_LOAD: "Carga inicial",
};

export const STOCK_MOVEMENT_TYPE_BADGE_VARIANT: Record<StockMovementType, BadgeVariant> = {
  PURCHASE: "success",
  RETURN: "success",
  INITIAL_LOAD: "success",
  SALE: "warning",
  ADJUSTMENT: "info",
};

export function isStockEntry(type: StockMovementType): boolean {
  return type === "PURCHASE" || type === "RETURN" || type === "INITIAL_LOAD";
}
