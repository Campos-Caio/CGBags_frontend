"use client";

import { useState } from "react";

import { PageHeader } from "@/components/admin/layout/PageHeader";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { TablePagination } from "@/components/admin/data/TablePagination";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminList } from "@/hooks/useAdminList";
import { listOrdersAdmin } from "@/services/order.service";
import type { Order, OrderStatus } from "@/types/order";
import { ORDER_STATUS_LABEL } from "@/utils/orderStatus";

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABEL) as [OrderStatus, string][];

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");

  const { data: orders, isLoading, page, setPage, pageSize } = useAdminList<Order>({
    fetchPage: ({ skip, limit }) =>
      listOrdersAdmin({
        search: search || undefined,
        status: statusFilter || undefined,
        skip,
        limit,
      }),
    deps: [search, statusFilter],
    errorMessage: "Não foi possível carregar os pedidos.",
  });

  function clearFilters() {
    setPage(0);
    setSearch("");
    setStatusFilter("");
  }

  const hasActiveFilters = search !== "" || statusFilter !== "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Pedidos" />

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
      </FilterBar>

      <Card>
        <CardContent>
          {isLoading ? (
            <LoadingState />
          ) : (
            <OrdersTable orders={orders} hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters} />
          )}
        </CardContent>
      </Card>

      <TablePagination page={page} onPageChange={setPage} itemCount={orders.length} pageSize={pageSize} />
    </div>
  );
}
