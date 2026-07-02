import type { OrderStatus } from "@/types/order";
import { ORDER_STATUS_BADGE_CLASS, ORDER_STATUS_LABEL } from "@/utils/orderStatus";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_BADGE_CLASS[status]}`}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

export { OrderStatusBadge };
