"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/admin/feedback/EmptyState";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listCustomerOrdersAdmin } from "@/services/customer.service";
import type { Order } from "@/types/order";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";

interface CustomerOrdersCardProps {
  customerId: number;
}

/** Historico de pedidos do cliente, direto na tela admin — antes so' dava
 * pra ver isso indo em Pedidos e filtrando manualmente por nome/e-mail. */
export function CustomerOrdersCard({ customerId }: CustomerOrdersCardProps) {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    listCustomerOrdersAdmin(customerId, { limit: 20 })
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error, "Não foi possível carregar os pedidos deste cliente."));
          setOrders([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [customerId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        {orders === null ? (
          <LoadingState />
        ) : orders.length === 0 ? (
          <EmptyState message="Nenhum pedido feito por este cliente." />
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-muted/40"
            >
              <div>
                <p className="font-medium text-foreground">Pedido #{order.id}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(order.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-foreground">{formatCurrency(order.total)}</span>
                <OrderStatusBadge status={order.status} />
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
