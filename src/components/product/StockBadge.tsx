import { Badge } from "@/components/ui/badge";
import { getStockStatus, STOCK_STATUS_BADGE_VARIANT, STOCK_STATUS_LABEL } from "@/utils/stock";

interface StockBadgeProps {
  stockQuantity: number;
}

function StockBadge({ stockQuantity }: StockBadgeProps) {
  const status = getStockStatus(stockQuantity);

  return <Badge variant={STOCK_STATUS_BADGE_VARIANT[status]}>{STOCK_STATUS_LABEL[status]}</Badge>;
}

export { StockBadge };
