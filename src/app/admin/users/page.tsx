"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { UsersTable } from "@/components/admin/users/UsersTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { listUsersAdmin } from "@/services/user.service";
import type { User } from "@/types/auth";
import { getApiErrorMessage } from "@/utils/apiError";

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      await Promise.resolve();
      if (cancelled) return;
      setIsLoading(true);

      try {
        const data = await listUsersAdmin({
          search: search || undefined,
          skip: page * PAGE_SIZE,
          limit: PAGE_SIZE,
        });
        if (!cancelled) setUsers(data);
      } catch (error) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error, "Não foi possível carregar os usuários."));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [search, page]);

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

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={users.length < PAGE_SIZE}
          onClick={() => setPage((p) => p + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
