"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { DefinitionRow } from "@/components/ui/definition-row";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { useAuth } from "@/context/AuthContext";
import { getMyOrderById } from "@/services/order.service";
import type { Order } from "@/types/order";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";

type PageStatus = "loading" | "ready" | "error";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");

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
          <OrderStatusBadge status={order.status} />
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
                label="Frete"
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
    </Container>
  );
}
