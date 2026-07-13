"use client";

import { useState } from "react";

import { AdminPagination } from "@/components/admin/AdminPagination";
import { CustomersTable } from "@/components/admin/customers/CustomersTable";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminList } from "@/hooks/useAdminList";
import { listCustomersAdmin } from "@/services/customer.service";
import type { Customer } from "@/types/customer";

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const {
    data: customers,
    setData: setCustomers,
    isLoading,
    page,
    setPage,
    pageSize,
  } = useAdminList<Customer>({
    fetchPage: ({ skip, limit }) =>
      listCustomersAdmin({
        search: search || undefined,
        is_active: !showInactive,
        skip,
        limit,
      }),
    deps: [search, showInactive],
    errorMessage: "Não foi possível carregar os clientes.",
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Clientes</h1>

      <Card>
        <CardContent className="flex flex-wrap gap-4">
          <Input
            placeholder="Buscar por nome ou CPF/CNPJ"
            value={search}
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
            className="max-w-xs"
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => {
                setPage(0);
                setShowInactive(e.target.checked);
              }}
            />
            Ver somente inativos/excluídos
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <CustomersTable customers={customers} onCustomersChange={setCustomers} />
          )}
        </CardContent>
      </Card>

      <AdminPagination page={page} onPageChange={setPage} itemCount={customers.length} pageSize={pageSize} />
    </div>
  );
}
