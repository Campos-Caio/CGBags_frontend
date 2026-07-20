"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { StatsCard } from "@/components/admin/cards/StatsCard";
import { EmptyState } from "@/components/admin/feedback/EmptyState";
import { ErrorState } from "@/components/admin/feedback/ErrorState";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminResource } from "@/hooks/useAdminResource";
import { getAdminDashboard } from "@/services/admin.service";
import { getFinanceDashboard } from "@/services/finance.service";
import type { AdminDashboard } from "@/types/admin";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";
import { getFinancePeriodRange } from "@/utils/financePeriod";
import { ORDER_STATUS_RELEVANCE_RANK } from "@/utils/orderStatus";

type PageStatus = "loading" | "ready" | "error";

const SECTION_LABEL_CLASS = "text-sm font-semibold tracking-tight text-foreground";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");

  // Resumo fixo do mês corrente — só um vislumbre rápido; o detalhamento
  // completo (período customizável, gráfico mensal, formas de pagamento)
  // mora em /admin/financeiro pra não sobrecarregar o Dashboard.
  const financeRange = getFinancePeriodRange("this_month");

  const { data: financeDashboard, status: financeStatus } = useAdminResource({
    fetch: () => getFinanceDashboard(financeRange.start, financeRange.end),
    deps: [financeRange.start, financeRange.end],
    errorMessage: "Não foi possível carregar o resumo financeiro.",
  });

  useEffect(() => {
    let cancelled = false;

    getAdminDashboard()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus("error");
        toast.error(getApiErrorMessage(error, "Não foi possível carregar o dashboard."));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return <LoadingState />;
  }

  if (status === "error" || !data) {
    return <ErrorState message="Não foi possível carregar o dashboard." />;
  }

  // Pedidos que exigem uma decisão (pagamento pendente/recusado primeiro, depois em
  // andamento) sobem pro topo — a mesma prioridade que "Meus pedidos" já usa pro cliente.
  const recentOrders = [...data.recent_orders].sort(
    (a, b) => ORDER_STATUS_RELEVANCE_RANK[a.status] - ORDER_STATUS_RELEVANCE_RANK[b.status]
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Dashboard" />

      <section className="flex flex-col gap-3">
        <h2 className={SECTION_LABEL_CLASS}>Alertas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatsCard
            label="Pedidos aguardando pagamento"
            value={String(data.pending_orders)}
            href="/admin/orders"
            severity="critical"
          />
          <StatsCard
            label="Produtos sem estoque"
            value={String(data.out_of_stock_count)}
            href="/admin/stock"
            severity="critical"
          />
          <StatsCard
            label="Pedidos aguardando envio"
            value={String(data.orders_awaiting_shipment)}
            href="/admin/orders"
            severity="attention"
          />
          <StatsCard
            label="Produtos com estoque crítico"
            value={String(data.low_stock_count)}
            href="/admin/stock"
            severity="attention"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className={SECTION_LABEL_CLASS}>Financeiro (este mês)</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/financeiro">Ver financeiro completo</Link>
          </Button>
        </div>
        {financeStatus === "loading" || !financeDashboard ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatsCard label="Receita líquida" value={formatCurrency(financeDashboard.effective_net_revenue)} />
            <StatsCard label="Ticket médio" value={formatCurrency(financeDashboard.average_ticket)} />
            <StatsCard label="Pedidos pagos" value={String(financeDashboard.paid_orders_count)} />
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={SECTION_LABEL_CLASS}>Operacional</h2>
        <div className="grid grid-cols-3 gap-4">
          <StatsCard label="Pedidos pagos" value={String(data.paid_orders)} />
          <StatsCard label="Pedidos cancelados" value={String(data.canceled_orders)} />
          <StatsCard label="Pedidos no total" value={String(data.total_orders)} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={SECTION_LABEL_CLASS}>Geral</h2>
        <div className="grid grid-cols-3 gap-4">
          <StatsCard label="Produtos ativos" value={String(data.total_products)} />
          <StatsCard label="Clientes cadastrados" value={String(data.total_customers)} />
          <StatsCard label="Contas de usuário" value={String(data.total_users)} />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos recentes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {recentOrders.length === 0 ? (
            <EmptyState message="Nenhum pedido registrado ainda." />
          ) : (
            recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-muted/40"
              >
                <div>
                  <p className="font-medium text-foreground">
                    #{order.id} · {order.customer_name}
                  </p>
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
    </div>
  );
}
