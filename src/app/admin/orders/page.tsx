"use client";

import { useState } from "react";

import { AdminPagination } from "@/components/admin/AdminPagination";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Pedidos</h1>

      <Card>
        <CardContent className="flex flex-wrap gap-4">
          <Input
            placeholder="Buscar por nome ou e-mail do cliente"
            value={search}
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
            className="max-w-xs"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(0);
              setStatusFilter(e.target.value as OrderStatus | "");
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">Todos os status</option>
            {STATUS_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <OrdersTable orders={orders} />
          )}
        </CardContent>
      </Card>

      <AdminPagination page={page} onPageChange={setPage} itemCount={orders.length} pageSize={pageSize} />
    </div>
  );
}
