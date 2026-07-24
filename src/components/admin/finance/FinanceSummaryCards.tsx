import { StatsCard } from "@/components/admin/cards/StatsCard";
import type { FinanceDashboard } from "@/types/finance";
import { formatCurrency } from "@/utils/currency";

interface FinanceSummaryCardsProps {
  dashboard: FinanceDashboard;
}

/** Grade de indicadores financeiros de um período — reaproveita o StatsCard do Dashboard geral. */
export function FinanceSummaryCards({ dashboard }: FinanceSummaryCardsProps) {
  const hasRefunds = Number(dashboard.total_refunds) > 0;
  const hasCanceled = Number(dashboard.canceled_orders_total) > 0;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <StatsCard label="Receita bruta" value={formatCurrency(dashboard.gross_revenue)} />
      <StatsCard label="Receita líquida" value={formatCurrency(dashboard.effective_net_revenue)} />
      <StatsCard label="Ticket médio" value={formatCurrency(dashboard.average_ticket)} />
      <StatsCard label="Pedidos pagos" value={String(dashboard.paid_orders_count)} />
      <StatsCard label="Frete total" value={formatCurrency(dashboard.total_shipping)} />
      <StatsCard label="Descontos concedidos" value={formatCurrency(dashboard.total_discounts)} />
      <StatsCard
        label="Reembolsos"
        value={formatCurrency(dashboard.total_refunds)}
        severity={hasRefunds ? "attention" : "neutral"}
      />
      <StatsCard
        label={`Total cancelado (${dashboard.canceled_orders_count})`}
        value={formatCurrency(dashboard.canceled_orders_total)}
        severity={hasCanceled ? "attention" : "neutral"}
      />
    </div>
  );
}
