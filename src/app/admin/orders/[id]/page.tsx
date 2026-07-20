"use client";

import { useParams } from "next/navigation";

import { DetailHeader } from "@/components/admin/layout/DetailHeader";
import { ErrorState } from "@/components/admin/feedback/ErrorState";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { AdminShipmentCard } from "@/components/admin/orders/AdminShipmentCard";
import { OrderStatusControl } from "@/components/admin/orders/OrderStatusControl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DefinitionRow } from "@/components/ui/definition-row";
import { useAdminResource } from "@/hooks/useAdminResource";
import { getOrderByIdAdmin } from "@/services/order.service";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);

  const { data: order, setData: setOrder, status } = useAdminResource({
    fetch: () => getOrderByIdAdmin(orderId),
    deps: [orderId],
    errorMessage: "Não foi possível carregar este pedido.",
  });

  if (status === "loading") {
    return <LoadingState />;
  }

  if (status === "error" || !order) {
    return <ErrorState message="Pedido não encontrado." />;
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
      <DetailHeader
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
                    <p className="font-medium text-foreground">
                      {item.product_name}
                      {item.variant_label ? ` — ${item.variant_label}` : ""}
                    </p>
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
                  label={order.coupon_code ? `Desconto (${order.coupon_code})` : "Desconto"}
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

          <AdminShipmentCard orderId={order.id} orderStatus={order.status} />
        </div>
      </div>
    </div>
  );
}
