"use client";

import { useState } from "react";

import { TablePagination } from "@/components/admin/data/TablePagination";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { CanceledOrdersReportTable } from "@/components/admin/finance/CanceledOrdersReportTable";
import { FinanceEntriesTable } from "@/components/admin/finance/FinanceEntriesTable";
import { FinancePeriodSelect } from "@/components/admin/finance/FinancePeriodSelect";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminList } from "@/hooks/useAdminList";
import {
  getCanceledOrdersReport,
  getRefundsReport,
  getSalesReport,
} from "@/services/finance.service";
import { getFinancePeriodRange, type FinancePeriodOption } from "@/utils/financePeriod";

type ReportTab = "sales" | "refunds" | "canceled";

const TAB_LABEL: Record<ReportTab, string> = {
  sales: "Vendas",
  refunds: "Reembolsos",
  canceled: "Pedidos cancelados",
};

interface ReportPanelProps {
  start: string;
  end: string;
}

// Cada aba tem seu proprio useAdminList (tipos diferentes: FinanceEntry vs
// CanceledOrder) em vez de um estado compartilhado entre as 3 — trocar de
// aba desmonta o painel anterior e monta um novo do zero (data/isLoading
// reiniciam sozinhos), o que evita qualquer chance de um formato de dado
// vazar pro componente da outra aba no frame entre o clique e a resposta
// da busca. `key` pelo periodo forca o mesmo remount (e reset de pagina)
// quando so' o periodo muda, sem precisar de reset manual de pagina.

function SalesReportPanel({ start, end }: ReportPanelProps) {
  const { data, isLoading, page, setPage, pageSize } = useAdminList({
    fetchPage: ({ skip, limit }) => getSalesReport({ start, end, skip, limit }),
    deps: [start, end],
    errorMessage: "Não foi possível carregar as vendas.",
  });

  return (
    <>
      <Card>
        <CardContent>
          {isLoading ? <LoadingState /> : <FinanceEntriesTable entries={data} emptyLabel="venda" />}
        </CardContent>
      </Card>
      <TablePagination page={page} onPageChange={setPage} itemCount={data.length} pageSize={pageSize} />
    </>
  );
}

function RefundsReportPanel({ start, end }: ReportPanelProps) {
  const { data, isLoading, page, setPage, pageSize } = useAdminList({
    fetchPage: ({ skip, limit }) => getRefundsReport({ start, end, skip, limit }),
    deps: [start, end],
    errorMessage: "Não foi possível carregar os reembolsos.",
  });

  return (
    <>
      <Card>
        <CardContent>
          {isLoading ? <LoadingState /> : <FinanceEntriesTable entries={data} emptyLabel="reembolso" />}
        </CardContent>
      </Card>
      <TablePagination page={page} onPageChange={setPage} itemCount={data.length} pageSize={pageSize} />
    </>
  );
}

function CanceledOrdersReportPanel({ start, end }: ReportPanelProps) {
  const { data, isLoading, page, setPage, pageSize } = useAdminList({
    fetchPage: ({ skip, limit }) => getCanceledOrdersReport({ start, end, skip, limit }),
    deps: [start, end],
    errorMessage: "Não foi possível carregar os pedidos cancelados.",
  });

  return (
    <>
      <Card>
        <CardContent>
          {isLoading ? <LoadingState /> : <CanceledOrdersReportTable orders={data} />}
        </CardContent>
      </Card>
      <TablePagination page={page} onPageChange={setPage} itemCount={data.length} pageSize={pageSize} />
    </>
  );
}

export default function AdminFinanceReportsPage() {
  const [tab, setTab] = useState<ReportTab>("sales");
  const [period, setPeriod] = useState<FinancePeriodOption>("this_month");
  const range = getFinancePeriodRange(period);
  const panelKey = `${range.start}-${range.end}`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Relatórios financeiros"
        subtitle="Vendas, reembolsos e pedidos cancelados por período."
        actions={<FinancePeriodSelect value={period} onChange={setPeriod} />}
      />

      <Tabs value={tab} onValueChange={(value) => setTab(value as ReportTab)}>
        <TabsList>
          <TabsTrigger value="sales">{TAB_LABEL.sales}</TabsTrigger>
          <TabsTrigger value="refunds">{TAB_LABEL.refunds}</TabsTrigger>
          <TabsTrigger value="canceled">{TAB_LABEL.canceled}</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "sales" && <SalesReportPanel key={panelKey} start={range.start} end={range.end} />}
      {tab === "refunds" && <RefundsReportPanel key={panelKey} start={range.start} end={range.end} />}
      {tab === "canceled" && (
        <CanceledOrdersReportPanel key={panelKey} start={range.start} end={range.end} />
      )}
    </div>
  );
}
