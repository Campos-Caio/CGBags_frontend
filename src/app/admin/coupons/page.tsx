"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/admin/layout/PageHeader";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { TablePagination } from "@/components/admin/data/TablePagination";
import { CouponsTable } from "@/components/admin/coupons/CouponsTable";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminList } from "@/hooks/useAdminList";
import { listCouponsAdmin } from "@/services/coupon.service";
import type { Coupon } from "@/types/coupon";

type StatusFilter = "all" | "active" | "inactive";

export default function AdminCouponsPage() {
  const [status, setStatus] = useState<StatusFilter>("all");

  const {
    data: coupons,
    setData: setCoupons,
    isLoading,
    page,
    setPage,
    pageSize,
  } = useAdminList<Coupon>({
    fetchPage: ({ skip, limit }) =>
      listCouponsAdmin({
        is_active: status === "all" ? undefined : status === "active",
        skip,
        limit,
      }),
    deps: [status],
    errorMessage: "Não foi possível carregar os cupons.",
  });

  function clearFilters() {
    setPage(0);
    setStatus("all");
  }

  const hasActiveFilters = status !== "all";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cupons"
        actions={
          <Button asChild>
            <Link href="/admin/coupons/new">
              <Plus className="size-3.5" aria-hidden />
              Novo cupom
            </Link>
          </Button>
        }
      />

      <FilterBar
        resultCount={coupons.length}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      >
        <Select value={status} onValueChange={(value) => { setPage(0); setStatus(value as StatusFilter); }}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Somente ativos</SelectItem>
            <SelectItem value="inactive">Somente inativos</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <Card>
        <CardContent>
          {isLoading ? (
            <LoadingState />
          ) : (
            <CouponsTable
              coupons={coupons}
              onCouponsChange={setCoupons}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          )}
        </CardContent>
      </Card>

      <TablePagination page={page} onPageChange={setPage} itemCount={coupons.length} pageSize={pageSize} />
    </div>
  );
}
