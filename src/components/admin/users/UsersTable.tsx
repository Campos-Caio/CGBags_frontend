"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { RowActionsMenu } from "@/components/admin/data/RowActionsMenu";
import { EmptyState } from "@/components/admin/feedback/EmptyState";
import { UserRoleToggle } from "@/components/admin/users/UserRoleToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { deleteUserAdmin } from "@/services/user.service";
import type { User } from "@/types/auth";
import { getApiErrorMessage } from "@/utils/apiError";
import { confirmToast } from "@/utils/confirmToast";
import { formatDateTime } from "@/utils/date";

interface UsersTableProps {
  users: User[];
  currentUserId: number;
  onUsersChange: (users: User[]) => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export function UsersTable({
  users,
  currentUserId,
  onUsersChange,
  hasActiveFilters = false,
  onClearFilters,
}: UsersTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function handleRoleChange(updated: User) {
    onUsersChange(users.map((u) => (u.id === updated.id ? updated : u)));
  }

  function handleDelete(user: User) {
    confirmToast(`Excluir o usuário "${user.email}"?`, () => performDelete(user), {
      confirmLabel: "Excluir",
    });
  }

  async function performDelete(user: User) {
    setDeletingId(user.id);
    try {
      await deleteUserAdmin(user.id);
      onUsersChange(users.filter((u) => u.id !== user.id));
      toast.success("Usuário excluído.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível excluir este usuário."));
    } finally {
      setDeletingId(null);
    }
  }

  if (users.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        message="Nenhum resultado para estes filtros."
        action={onClearFilters ? { label: "Limpar filtros", onClick: onClearFilters } : undefined}
      />
    ) : (
      <EmptyState message="Nenhum usuário encontrado." />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>E-mail</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          return (
            <TableRow key={user.id}>
              <TableCell className="font-medium text-foreground">
                {user.email}
                {isSelf && (
                  <Badge variant="muted" size="sm" className="ml-1.5">
                    Você
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(user.created_at)}
              </TableCell>
              <TableCell>
                <UserRoleToggle user={user} onChange={handleRoleChange} disabled={isSelf} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" aria-label="Ver usuário" asChild>
                        <Link href={`/admin/users/${user.id}`}>
                          <Eye className="size-3.5" aria-hidden />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ver usuário</TooltipContent>
                  </Tooltip>
                  <RowActionsMenu
                    actions={[
                      {
                        label: "Excluir usuário",
                        icon: Trash2,
                        variant: "destructive",
                        disabled: isSelf || deletingId === user.id,
                        onClick: () => handleDelete(user),
                      },
                    ]}
                  />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
