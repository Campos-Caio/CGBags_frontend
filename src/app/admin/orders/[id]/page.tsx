"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { AdminDetailHeader } from "@/components/admin/AdminDetailHeader";
import { OrderStatusControl } from "@/components/admin/orders/OrderStatusControl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DefinitionRow } from "@/components/ui/definition-row";
import { getOrderByIdAdmin } from "@/services/order.service";
import type { Order } from "@/types/order";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";

type PageStatus = "loading" | "ready" | "error";

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    getOrderByIdAdmin(orderId)
      .then((data) => {
        if (cancelled) return;
        if (data === null) {
          setStatus("error");
          return;
        }
        setOrder(data);
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus("error");
        toast.error(getApiErrorMessage(error, "Não foi possível carregar este pedido."));
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (status === "loading") {
    return <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>;
  }

  if (status === "error" || !order) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Pedido não encontrado.</p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar para pedidos
        </Link>
      </div>
    );
  }

  const address = [
    `${order.shipping_street}, ${order.shipping_number}`,
    order.shipping_complement,
    order.shipping_neighborhood,
    `${order.shipping_city}/${order.shipping_state}`,
    order.shipping_zip_code,
  ]
    .filter(Boolean)
    .join(" — ");

  return (
    <div className="flex flex-col">
      <AdminDetailHeader
        backHref="/admin/orders"
        backLabel="Voltar para pedidos"
        title={`Pedido #${order.id}`}
        subtitle={`Feito em ${formatDateTime(order.created_at)}`}
        actions={<OrderStatusControl order={order} onChange={setOrder} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Itens do pedido</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.sku} · {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <p className="font-medium text-foreground">{formatCurrency(item.total_price)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border">
              <DefinitionRow size="lg" label="Subtotal" value={formatCurrency(order.subtotal)} />
              <DefinitionRow
                size="lg"
                label={order.shipping_method ? `Frete (${order.shipping_method})` : "Frete"}
                value={formatCurrency(order.shipping_cost)}
              />
              {Number(order.discount) > 0 && (
                <DefinitionRow
                  size="lg"
                  label="Desconto"
                  value={`- ${formatCurrency(order.discount)}`}
                />
              )}
              <DefinitionRow size="lg" label="Total" value={formatCurrency(order.total)} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-1 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border">
              <DefinitionRow size="lg" label="Nome" value={order.customer_name} />
              <DefinitionRow size="lg" label="E-mail" value={order.customer_email} />
              <DefinitionRow size="lg" label="Telefone" value={order.customer_phone} />
              <DefinitionRow size="lg" label="CPF/CNPJ" value={order.customer_document} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço de entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{address}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
