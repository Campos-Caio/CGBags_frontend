"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

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
import type { Order } from "@/types/order";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";

interface OrdersTableProps {
  orders: Order[];
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export function OrdersTable({ orders, hasActiveFilters = false, onClearFilters }: OrdersTableProps) {
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
              <div className="flex justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" aria-label="Ver pedido" asChild>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="size-3.5" aria-hidden />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ver pedido</TooltipContent>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
