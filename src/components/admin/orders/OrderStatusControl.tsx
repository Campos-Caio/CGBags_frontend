"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { cancelOrderAdmin, updateOrderStatusAdmin } from "@/services/order.service";
import type { Order, OrderStatus } from "@/types/order";
import { ORDER_STATUS_LABEL } from "@/utils/orderStatus";
import { confirmToast } from "@/utils/confirmToast";
import { getApiErrorMessage } from "@/utils/apiError";

// Espelha o fluxo de fulfillment aceito por OrderService.update_status no
// backend — o backend e a fonte da verdade, isso e so pra saber qual botao
// de "avancar" mostrar.
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PAID: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

const CANCELLABLE_STATUSES: OrderStatus[] = ["PENDING_PAYMENT", "PAYMENT_FAILED", "PAID"];

interface OrderStatusControlProps {
  order: Order;
  onChange: (order: Order) => void;
}

export function OrderStatusControl({ order, onChange }: OrderStatusControlProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const nextStatus = NEXT_STATUS[order.status];
  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  async function advance() {
    if (!nextStatus) return;
    setIsUpdating(true);
    try {
      const updated = await updateOrderStatusAdmin(order.id, nextStatus);
      onChange(updated);
      toast.success("Status do pedido atualizado.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar o status do pedido."));
    } finally {
      setIsUpdating(false);
    }
  }

  function handleCancel() {
    const message =
      order.status === "PAID"
        ? "Cancelar este pedido? O valor pago será estornado."
        : "Cancelar este pedido?";
    confirmToast(message, performCancel, { confirmLabel: "Cancelar pedido" });
  }

  async function performCancel() {
    setIsUpdating(true);
    try {
      const updated = await cancelOrderAdmin(order.id);
      onChange(updated);
      toast.success("Pedido cancelado.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível cancelar este pedido."));
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <OrderStatusBadge status={order.status} />
      <div className="flex gap-2">
        {nextStatus && (
          <Button size="sm" disabled={isUpdating} onClick={advance}>
            {isUpdating ? "Atualizando..." : `Marcar como ${ORDER_STATUS_LABEL[nextStatus]}`}
          </Button>
        )}
        {canCancel && (
          <Button variant="outline" size="sm" disabled={isUpdating} onClick={handleCancel}>
            Cancelar pedido
          </Button>
        )}
      </div>
    </div>
  );
}
