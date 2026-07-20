"use client";

import { useState } from "react";

import { StatsCard } from "@/components/admin/cards/StatsCard";
import { FinancePeriodSelect } from "@/components/admin/finance/FinancePeriodSelect";
import { FinanceSummaryCards } from "@/components/admin/finance/FinanceSummaryCards";
import { MonthlyRevenueChart } from "@/components/admin/finance/MonthlyRevenueChart";
import { PaymentMethodBreakdown } from "@/components/admin/finance/PaymentMethodBreakdown";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import { useAdminResource } from "@/hooks/useAdminResource";
import { getMelhorEnvioBalance } from "@/services/admin.service";
import { getFinanceDashboard, getSalesByPaymentMethod } from "@/services/finance.service";
import { formatCurrency } from "@/utils/currency";
import { getFinancePeriodRange, type FinancePeriodOption } from "@/utils/financePeriod";

const SECTION_LABEL_CLASS = "text-sm font-semibold tracking-tight text-foreground";

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

  const { data: melhorEnvioBalance } = useAdminResource({
    fetch: () => getMelhorEnvioBalance(),
    deps: [],
    errorMessage: "Não foi possível carregar o saldo do Melhor Envio.",
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

      {melhorEnvioBalance && (
        <section className="flex flex-col gap-3">
          <h2 className={SECTION_LABEL_CLASS}>Melhor Envio</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatsCard label="Saldo disponível" value={formatCurrency(melhorEnvioBalance.balance)} />
            {Number(melhorEnvioBalance.reserved) > 0 && (
              <StatsCard label="Reservado" value={formatCurrency(melhorEnvioBalance.reserved)} />
            )}
            {Number(melhorEnvioBalance.debts) > 0 && (
              <StatsCard
                label="Dívidas"
                value={formatCurrency(melhorEnvioBalance.debts)}
                severity="critical"
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
}
