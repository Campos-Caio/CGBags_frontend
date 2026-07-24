"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/layout/PageHeader";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { TablePagination } from "@/components/admin/data/TablePagination";
import { OrderPeriodSelect } from "@/components/admin/orders/OrderPeriodSelect";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminList } from "@/hooks/useAdminList";
import { exportOrdersAdmin, listOrdersAdmin } from "@/services/order.service";
import type { Order, OrderStatus } from "@/types/order";
import { getApiErrorMessage } from "@/utils/apiError";
import { getOrderPeriodRange, type OrderPeriodOption } from "@/utils/orderPeriod";
import { ORDER_STATUS_LABEL } from "@/utils/orderStatus";

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABEL) as [OrderStatus, string][];

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [period, setPeriod] = useState<OrderPeriodOption>("all");
  const [isExporting, setIsExporting] = useState(false);
  const range = getOrderPeriodRange(period);

  async function handleExport() {
    setIsExporting(true);
    try {
      await exportOrdersAdmin({
        search: search || undefined,
        status: statusFilter || undefined,
        start: range.start,
        end: range.end,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível exportar os pedidos."));
    } finally {
      setIsExporting(false);
    }
  }

  const { data: orders, setData: setOrders, isLoading, page, setPage, pageSize } = useAdminList<Order>({
    fetchPage: ({ skip, limit }) =>
      listOrdersAdmin({
        search: search || undefined,
        status: statusFilter || undefined,
        start: range.start,
        end: range.end,
        skip,
        limit,
      }),
    deps: [search, statusFilter, range.start, range.end],
    errorMessage: "Não foi possível carregar os pedidos.",
  });

  function handleOrderChange(updated: Order) {
    setOrders(orders.map((o) => (o.id === updated.id ? updated : o)));
  }

  function clearFilters() {
    setPage(0);
    setSearch("");
    setStatusFilter("");
    setPeriod("all");
  }

  const hasActiveFilters = search !== "" || statusFilter !== "" || period !== "all";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pedidos"
        actions={
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            <Download className="size-3.5" aria-hidden />
            {isExporting ? "Exportando..." : "Exportar CSV"}
          </Button>
        }
      />

      <FilterBar
        resultCount={orders.length}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      >
        <Input
          placeholder="Buscar por nome ou e-mail do cliente"
          value={search}
          onChange={(e) => {
            setPage(0);
            setSearch(e.target.value);
          }}
          className="max-w-xs"
        />
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => {
            setPage(0);
            setStatusFilter(value === "all" ? "" : (value as OrderStatus));
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {STATUS_OPTIONS.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <OrderPeriodSelect
          value={period}
          onChange={(value) => {
            setPage(0);
            setPeriod(value);
          }}
        />
      </FilterBar>

      <Card>
        <CardContent>
          {isLoading ? (
            <LoadingState />
          ) : (
            <OrdersTable
              orders={orders}
              onOrderChange={handleOrderChange}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          )}
        </CardContent>
      </Card>

      <TablePagination page={page} onPageChange={setPage} itemCount={orders.length} pageSize={pageSize} />
    </div>
  );
}
