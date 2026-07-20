"use client";

import { useState } from "react";

import { PageHeader } from "@/components/admin/layout/PageHeader";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { TablePagination } from "@/components/admin/data/TablePagination";
import { CustomersTable } from "@/components/admin/customers/CustomersTable";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

  function clearFilters() {
    setPage(0);
    setSearch("");
    setShowInactive(false);
  }

  const hasActiveFilters = search !== "" || showInactive;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Clientes" />

      <FilterBar
        resultCount={customers.length}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      >
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
          <Checkbox
            checked={showInactive}
            onCheckedChange={(checked) => {
              setPage(0);
              setShowInactive(checked === true);
            }}
          />
          Ver somente inativos/excluídos
        </label>
      </FilterBar>

      <Card>
        <CardContent>
          {isLoading ? (
            <LoadingState />
          ) : (
            <CustomersTable
              customers={customers}
              onCustomersChange={setCustomers}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          )}
        </CardContent>
      </Card>

      <TablePagination page={page} onPageChange={setPage} itemCount={customers.length} pageSize={pageSize} />
    </div>
  );
}
