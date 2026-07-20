"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { DefinitionRow } from "@/components/ui/definition-row";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { OrderTrackingTimeline } from "@/components/order/OrderTrackingTimeline";
import { useAuth } from "@/context/AuthContext";
import { cancelOrder, getMyOrderById, getOrderTracking } from "@/services/order.service";
import type { Order, OrderStatus } from "@/types/order";
import type { OrderTracking } from "@/types/tracking";
import { getApiErrorMessage } from "@/utils/apiError";
import { confirmToast } from "@/utils/confirmToast";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";

type PageStatus = "loading" | "ready" | "error";

const CANCELLABLE_STATUSES: OrderStatus[] = ["PENDING_PAYMENT", "PAYMENT_FAILED", "PAID"];
const PAYABLE_STATUSES: OrderStatus[] = ["PENDING_PAYMENT", "PAYMENT_FAILED"];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [isCancelling, setIsCancelling] = useState(false);
  const [tracking, setTracking] = useState<OrderTracking | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    async function loadOrder() {
      await Promise.resolve();

      const orderId = Number(params.id);
      if (!Number.isInteger(orderId)) {
        if (!cancelled) setStatus("error");
        return;
      }

      try {
        const data = await getMyOrderById(orderId);
        if (cancelled) return;
        setOrder(data);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        toast.error(getApiErrorMessage(error, "Não foi possível carregar este pedido."));
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, params.id]);

  useEffect(() => {
    if (!order) return;

    let cancelled = false;

    // Informativo — se falhar, o resto da tela do pedido continua util sem
    // o rastreio, entao nao mostra toast nem bloqueia nada.
    getOrderTracking(order.id)
      .then((data) => {
        if (!cancelled) setTracking(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- so' refaz pelo id, nao pela identidade do objeto Order inteiro
  }, [order?.id]);

  function handleCancel() {
    if (!order) return;
    const message =
      order.status === "PAID"
        ? "Cancelar este pedido? O valor pago será estornado."
        : "Cancelar este pedido?";
    confirmToast(message, performCancel, { confirmLabel: "Cancelar pedido" });
  }

  async function performCancel() {
    if (!order) return;
    setIsCancelling(true);
    try {
      const updated = await cancelOrder(order.id);
      setOrder(updated);
      toast.success("Pedido cancelado.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível cancelar este pedido."));
    } finally {
      setIsCancelling(false);
    }
  }

  if (authLoading || !isAuthenticated || status === "loading") {
    return (
      <Container className="py-16 text-center text-muted-foreground">Carregando...</Container>
    );
  }

  if (status === "error" || !order) {
    return (
      <Container className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Pedido não encontrado
        </h1>
        <p className="max-w-prose text-muted-foreground">
          Não foi possível encontrar este pedido, ou ele não pertence à sua conta.
        </p>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar para meus pedidos
        </Link>
      </Container>
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
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/account/orders"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar para meus pedidos
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              Pedido #{order.id}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Feito em {formatDateTime(order.created_at)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <OrderStatusBadge status={order.status} />
            <div className="flex gap-2">
              {PAYABLE_STATUSES.includes(order.status) && (
                <Button size="sm" asChild>
                  <Link href={`/checkout/payment/${order.id}`}>Pagar agora</Link>
                </Button>
              )}
              {CANCELLABLE_STATUSES.includes(order.status) && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isCancelling}
                  onClick={handleCancel}
                >
                  {isCancelling ? "Cancelando..." : "Cancelar pedido"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6">
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
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <p className="font-medium text-foreground">
                    {formatCurrency(item.total_price)}
                  </p>
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
              <CardTitle>Endereço de entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{address}</p>
            </CardContent>
          </Card>

          {tracking && <OrderTrackingTimeline tracking={tracking} />}
        </div>
      </div>
    </Container>
  );
}
