import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/order";
import { ORDER_STATUS_BADGE_VARIANT, ORDER_STATUS_LABEL } from "@/utils/orderStatus";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <Badge variant={ORDER_STATUS_BADGE_VARIANT[status]}>{ORDER_STATUS_LABEL[status]}</Badge>;
}

export { OrderStatusBadge };
