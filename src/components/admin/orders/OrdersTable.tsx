"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/admin/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { updateOrderStatusAdmin } from "@/services/order.service";
import type { Order } from "@/types/order";
import { getApiErrorMessage } from "@/utils/apiError";
import { confirmToast } from "@/utils/confirmToast";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";

interface OrdersTableProps {
  orders: Order[];
  onOrderChange?: (order: Order) => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export function OrdersTable({
  orders,
  onOrderChange,
  hasActiveFilters = false,
  onClearFilters,
}: OrdersTableProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  function handleMarkDelivered(order: Order) {
    confirmToast(`Marcar o pedido #${order.id} como entregue?`, () => performMarkDelivered(order), {
      confirmLabel: "Marcar como entregue",
    });
  }

  async function performMarkDelivered(order: Order) {
    setUpdatingId(order.id);
    try {
      const updated = await updateOrderStatusAdmin(order.id, "DELIVERED");
      onOrderChange?.(updated);
      toast.success("Pedido marcado como entregue.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível marcar este pedido como entregue."));
    } finally {
      setUpdatingId(null);
    }
  }

  if (orders.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        message="Nenhum resultado para estes filtros."
        action={onClearFilters ? { label: "Limpar filtros", onClick: onClearFilters } : undefined}
      />
    ) : (
      <EmptyState message="Nenhum pedido encontrado." />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pedido</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium text-foreground">#{order.id}</TableCell>
            <TableCell className="text-muted-foreground">
              <div>{order.customer_name}</div>
              <div className="text-xs">{order.customer_email}</div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDateTime(order.created_at)}
            </TableCell>
            <TableCell className="font-medium text-foreground">{formatCurrency(order.total)}</TableCell>
            <TableCell>
              <OrderStatusBadge status={order.status} />
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-1.5">
                {order.status === "SHIPPED" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label="Marcar como entregue"
                        disabled={updatingId === order.id}
                        onClick={() => handleMarkDelivered(order)}
                      >
                        <CheckCircle2 className="size-3.5" aria-hidden />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Marcar como entregue</TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" aria-label="Editar pedido" asChild>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Pencil className="size-3.5" aria-hidden />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar pedido</TooltipContent>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
