import { getStockStatus, STOCK_STATUS_BADGE_CLASS, STOCK_STATUS_LABEL } from "@/utils/stock";

interface StockBadgeProps {
  stockQuantity: number;
}

function StockBadge({ stockQuantity }: StockBadgeProps) {
  const status = getStockStatus(stockQuantity);

  return (
    <span
      className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${STOCK_STATUS_BADGE_CLASS[status]}`}
    >
      {STOCK_STATUS_LABEL[status]}
    </span>
  );
}

export { StockBadge };
