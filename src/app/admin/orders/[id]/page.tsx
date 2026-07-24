"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DetailHeader } from "@/components/admin/layout/DetailHeader";
import { ErrorState } from "@/components/admin/feedback/ErrorState";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { AdminShipmentCard } from "@/components/admin/orders/AdminShipmentCard";
import { OrderStatusControl } from "@/components/admin/orders/OrderStatusControl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DefinitionRow } from "@/components/ui/definition-row";
import { useAdminResource } from "@/hooks/useAdminResource";
import { getOrderByIdAdmin, updateOrderNoteAdmin } from "@/services/order.service";
import { getApiErrorMessage } from "@/utils/apiError";
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

  const [note, setNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Resincroniza o rascunho da nota sempre que um pedido (novo ou diferente) carrega.
  const [syncedOrderId, setSyncedOrderId] = useState<number | null>(null);
  if (order && order.id !== syncedOrderId) {
    setSyncedOrderId(order.id);
    setNote(order.internal_note ?? "");
  }

  async function handleSaveNote() {
    if (!order) return;
    setIsSavingNote(true);
    try {
      const updated = await updateOrderNoteAdmin(order.id, note.trim() || null);
      setOrder(updated);
      toast.success("Nota salva.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível salvar a nota."));
    } finally {
      setIsSavingNote(false);
    }
  }

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

          <Card>
            <CardHeader>
              <CardTitle>Anotações internas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                Visível só para a equipe — nunca aparece pro cliente.
              </p>
              <textarea
                id="order-internal-note"
                rows={3}
                placeholder="Ex.: cliente pediu para ligar antes de entregar"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              />
              <Button
                type="button"
                size="sm"
                className="self-end"
                disabled={isSavingNote || note === (order.internal_note ?? "")}
                onClick={handleSaveNote}
              >
                {isSavingNote ? "Salvando..." : "Salvar nota"}
              </Button>
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
