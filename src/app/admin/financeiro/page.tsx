"use client";

import { useState } from "react";

import { FinancePeriodSelect } from "@/components/admin/finance/FinancePeriodSelect";
import { FinanceSummaryCards } from "@/components/admin/finance/FinanceSummaryCards";
import { MonthlyRevenueChart } from "@/components/admin/finance/MonthlyRevenueChart";
import { PaymentMethodBreakdown } from "@/components/admin/finance/PaymentMethodBreakdown";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import { useAdminResource } from "@/hooks/useAdminResource";
import { getFinanceDashboard, getSalesByPaymentMethod } from "@/services/finance.service";
import { getFinancePeriodRange, type FinancePeriodOption } from "@/utils/financePeriod";

export default function AdminFinancePage() {
  const [period, setPeriod] = useState<FinancePeriodOption>("this_month");
  const range = getFinancePeriodRange(period);

  const { data: dashboard, status } = useAdminResource({
    fetch: () => getFinanceDashboard(range.start, range.end),
    deps: [range.start, range.end],
    errorMessage: "Não foi possível carregar o resumo financeiro.",
  });

  const { data: paymentMethodBreakdown } = useAdminResource({
    fetch: () => getSalesByPaymentMethod(range.start, range.end),
    deps: [range.start, range.end],
    errorMessage: "Não foi possível carregar as vendas por forma de pagamento.",
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Financeiro"
        actions={<FinancePeriodSelect value={period} onChange={setPeriod} />}
      />

      {status === "loading" || !dashboard ? (
        <p className="py-4 text-center text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <FinanceSummaryCards dashboard={dashboard} />
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MonthlyRevenueChart />
        {paymentMethodBreakdown && <PaymentMethodBreakdown data={paymentMethodBreakdown} />}
      </div>
    </div>
  );
}
