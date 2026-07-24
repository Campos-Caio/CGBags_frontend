"use client";

import { useState } from "react";

import { AuditLogTable } from "@/components/admin/audit/AuditLogTable";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { TablePagination } from "@/components/admin/data/TablePagination";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminList } from "@/hooks/useAdminList";
import { listAuditLogs } from "@/services/audit.service";
import type { AuditLog } from "@/types/audit";
import { AUDIT_ENTITIES } from "@/utils/auditEntity";

export default function AdminAuditPage() {
  const [entity, setEntity] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const { data: logs, isLoading, page, setPage, pageSize } = useAdminList<AuditLog>({
    fetchPage: ({ skip, limit }) =>
      listAuditLogs({
        entity: entity || undefined,
        start: start || undefined,
        end: end || undefined,
        skip,
        limit,
      }),
    deps: [entity, start, end],
    errorMessage: "Não foi possível carregar o histórico de auditoria.",
  });

  function clearFilters() {
    setPage(0);
    setEntity("");
    setStart("");
    setEnd("");
  }

  const hasActiveFilters = entity !== "" || start !== "" || end !== "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Auditoria"
        subtitle="Histórico imutável de eventos do sistema — criação, atualização e exclusão de registros."
      />

      <FilterBar
        resultCount={logs.length}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      >
        <Select
          value={entity || "all"}
          onValueChange={(value) => {
            setPage(0);
            setEntity(value === "all" ? "" : value);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as entidades</SelectItem>
            {AUDIT_ENTITIES.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={start}
          onChange={(e) => {
            setPage(0);
            setStart(e.target.value);
          }}
          className="w-40"
          aria-label="Data inicial"
        />
        <Input
          type="date"
          value={end}
          onChange={(e) => {
            setPage(0);
            setEnd(e.target.value);
          }}
          className="w-40"
          aria-label="Data final"
        />
      </FilterBar>

      <Card>
        <CardContent>
          {isLoading ? (
            <LoadingState />
          ) : (
            <AuditLogTable logs={logs} hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters} />
          )}
        </CardContent>
      </Card>

      <TablePagination page={page} onPageChange={setPage} itemCount={logs.length} pageSize={pageSize} />
    </div>
  );
}
