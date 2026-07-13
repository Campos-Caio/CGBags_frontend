"use client";

import { useState } from "react";

import { AdminPagination } from "@/components/admin/AdminPagination";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Usuários</h1>

      <Card>
        <CardContent className="flex flex-wrap gap-4">
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
          <select
            value={roleFilter}
            onChange={(e) => {
              setPage(0);
              setRoleFilter(e.target.value as "" | "admin" | "customer");
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">Todos os papéis</option>
            <option value="admin">Admins</option>
            <option value="customer">Clientes</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {isLoading || !currentUser ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <UsersTable users={users} currentUserId={currentUser.id} onUsersChange={setUsers} />
          )}
        </CardContent>
      </Card>

      <AdminPagination page={page} onPageChange={setPage} itemCount={users.length} pageSize={pageSize} />
    </div>
  );
}
