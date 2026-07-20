"use client";

import { useState } from "react";

import { PageHeader } from "@/components/admin/layout/PageHeader";
import { FilterBar } from "@/components/admin/data/FilterBar";
import { TablePagination } from "@/components/admin/data/TablePagination";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useAdminList } from "@/hooks/useAdminList";
import { listUsersAdmin } from "@/services/user.service";
import type { User } from "@/types/auth";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [roleFilter, setRoleFilter] = useState<"" | "admin" | "customer">("");

  const {
    data: users,
    setData: setUsers,
    isLoading,
    page,
    setPage,
    pageSize,
  } = useAdminList<User>({
    fetchPage: ({ skip, limit }) =>
      listUsersAdmin({
        search: search || undefined,
        is_active: !showInactive,
        is_admin: roleFilter ? roleFilter === "admin" : undefined,
        skip,
        limit,
      }),
    deps: [search, showInactive, roleFilter],
    errorMessage: "Não foi possível carregar os usuários.",
  });

  function clearFilters() {
    setPage(0);
    setSearch("");
    setShowInactive(false);
    setRoleFilter("");
  }

  const hasActiveFilters = search !== "" || showInactive || roleFilter !== "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Usuários" />

      <FilterBar
        resultCount={users.length}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      >
        <Input
          placeholder="Buscar por e-mail"
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
        <Select
          value={roleFilter || "all"}
          onValueChange={(value) => {
            setPage(0);
            setRoleFilter(value === "all" ? "" : (value as "admin" | "customer"));
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os papéis</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="customer">Clientes</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <Card>
        <CardContent>
          {isLoading || !currentUser ? (
            <LoadingState />
          ) : (
            <UsersTable
              users={users}
              currentUserId={currentUser.id}
              onUsersChange={setUsers}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          )}
        </CardContent>
      </Card>

      <TablePagination page={page} onPageChange={setPage} itemCount={users.length} pageSize={pageSize} />
    </div>
  );
}
