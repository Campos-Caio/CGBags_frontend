"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/layout/PageHeader";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { TablePagination } from "@/components/admin/data/TablePagination";
import { QuotesTable } from "@/components/admin/quotes/QuotesTable";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminList } from "@/hooks/useAdminList";
import { listCustomersAdmin } from "@/services/customer.service";
import { listProductsAdmin } from "@/services/product.service";
import { listQuoteRequestsAdmin } from "@/services/quote.service";
import type { Customer } from "@/types/customer";
import type { Product } from "@/types/product";
import type { CustomQuoteRequest, CustomQuoteStatus } from "@/types/quote";
import { getApiErrorMessage } from "@/utils/apiError";
import { QUOTE_STATUS_LABEL } from "@/utils/quoteStatus";

const STATUS_OPTIONS = Object.entries(QUOTE_STATUS_LABEL) as [CustomQuoteStatus, string][];

export default function AdminQuotesPage() {
  const [statusFilter, setStatusFilter] = useState<CustomQuoteStatus | "">("");
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const { data: quotes, isLoading, page, setPage, pageSize } = useAdminList<CustomQuoteRequest>({
    fetchPage: ({ skip, limit }) =>
      listQuoteRequestsAdmin({
        quote_status: statusFilter || undefined,
        skip,
        limit,
      }),
    deps: [statusFilter],
    errorMessage: "Não foi possível carregar as solicitações de orçamento.",
  });

  useEffect(() => {
    listProductsAdmin()
      .then(setProducts)
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Não foi possível carregar os produtos."));
      });
  }, []);

  useEffect(() => {
    listCustomersAdmin()
      .then(setCustomers)
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Não foi possível carregar os clientes."));
      });
  }, []);

  function clearFilters() {
    setPage(0);
    setStatusFilter("");
  }

  const hasActiveFilters = statusFilter !== "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Orçamentos personalizados" />

      <FilterBar
        resultCount={quotes.length}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      >
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => {
            setPage(0);
            setStatusFilter(value === "all" ? "" : (value as CustomQuoteStatus));
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
            <QuotesTable
              quotes={quotes}
              products={products}
              customers={customers}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          )}
        </CardContent>
      </Card>

      <TablePagination page={page} onPageChange={setPage} itemCount={quotes.length} pageSize={pageSize} />
    </div>
  );
}
