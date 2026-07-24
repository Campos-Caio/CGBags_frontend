import Link from "next/link";

import { EmptyState } from "@/components/admin/feedback/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import type { CanceledOrder } from "@/types/finance";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";

interface CanceledOrdersReportTableProps {
  orders: CanceledOrder[];
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export function CanceledOrdersReportTable({
  orders,
  hasActiveFilters = false,
  onClearFilters,
}: CanceledOrdersReportTableProps) {
  if (orders.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        message="Nenhum resultado para estes filtros."
        action={onClearFilters ? { label: "Limpar filtros", onClick: onClearFilters } : undefined}
      />
    ) : (
      <EmptyState message="Nenhum pedido cancelado neste período." />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pedido</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Cancelado em</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium text-foreground">
              <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                #{order.id}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              <div>{order.customer_name}</div>
              <div className="text-xs">{order.customer_email}</div>
            </TableCell>
            <TableCell className="font-medium text-foreground">{formatCurrency(order.total)}</TableCell>
            <TableCell>
              <OrderStatusBadge status={order.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">{formatDateTime(order.updated_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
