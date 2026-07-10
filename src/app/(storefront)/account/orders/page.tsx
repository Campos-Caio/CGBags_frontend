"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { PackageSearch } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { useAuth } from "@/context/AuthContext";
import { listMyOrders } from "@/services/order.service";
import type { Order } from "@/types/order";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

type PageStatus = "loading" | "ready" | "needs-profile" | "error";

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<PageStatus>("loading");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    async function loadOrders() {
      await Promise.resolve();

      try {
        const data = await listMyOrders();
        if (cancelled) return;
        setOrders(data);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;

        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setStatus("needs-profile");
          return;
        }

        setStatus("error");
        toast.error(getApiErrorMessage(error, "Não foi possível carregar seus pedidos."));
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated || status === "loading") {
    return (
      <Container className="py-16 text-center text-muted-foreground">Carregando...</Container>
    );
  }

  if (status === "needs-profile") {
    return (
      <Container className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Meus pedidos</h1>
        <p className="max-w-prose text-muted-foreground">
          Finalize seu cadastro para ver o histórico de pedidos.
        </p>
        <Button asChild>
          <Link href="/account/complete-profile">Completar cadastro</Link>
        </Button>
      </Container>
    );
  }

  if (status === "error") {
    return (
      <Container className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Meus pedidos</h1>
        <p className="max-w-prose text-muted-foreground">
          Não foi possível carregar seus pedidos agora. Tente novamente em instantes.
        </p>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container className="flex flex-col items-center gap-4 py-24 text-center">
        <PackageSearch className="size-10 text-muted-foreground" aria-hidden />
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Você ainda não fez nenhum pedido
        </h1>
        <Button asChild>
          <Link href="/products">Ver produtos</Link>
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          Meus pedidos
        </h1>

        <div className="mt-8 flex flex-col gap-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <Link key={order.id} href={`/account/orders/${order.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">Pedido #{order.id}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(order.created_at)} · {itemCount}{" "}
                        {itemCount === 1 ? "item" : "itens"}
                      </p>
                      <div className="mt-2">
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </div>

                    <p className="font-heading text-lg font-semibold text-foreground">
                      {formatCurrency(order.total)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </Container>
  );
}
