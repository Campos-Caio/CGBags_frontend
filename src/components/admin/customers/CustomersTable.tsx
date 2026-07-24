"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { RowActionsMenu } from "@/components/admin/data/RowActionsMenu";
import { EmptyState } from "@/components/admin/feedback/EmptyState";
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
import { deleteCustomerAdmin } from "@/services/customer.service";
import type { Customer } from "@/types/customer";
import { getApiErrorMessage } from "@/utils/apiError";
import { confirmToast } from "@/utils/confirmToast";

const PERSON_TYPE_LABEL: Record<Customer["person_type"], string> = {
  PF: "Pessoa física",
  PJ: "Pessoa jurídica",
};

interface CustomersTableProps {
  customers: Customer[];
  onCustomersChange: (customers: Customer[]) => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export function CustomersTable({
  customers,
  onCustomersChange,
  hasActiveFilters = false,
  onClearFilters,
}: CustomersTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function handleDelete(customer: Customer) {
    const itemCount = customer.cart_item_count ?? 0;
    const message =
      itemCount > 0
        ? `O cliente "${customer.full_name}" tem ${itemCount} ${itemCount === 1 ? "item" : "itens"} no carrinho — eles serão perdidos. Excluir mesmo assim?`
        : `Excluir o cliente "${customer.full_name}"?`;

    confirmToast(message, () => performDelete(customer), {
      confirmLabel: "Excluir",
    });
  }

  async function performDelete(customer: Customer) {
    setDeletingId(customer.id);
    try {
      await deleteCustomerAdmin(customer.id);
      onCustomersChange(customers.filter((c) => c.id !== customer.id));
      toast.success("Cliente excluído.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível excluir este cliente."));
    } finally {
      setDeletingId(null);
    }
  }

  if (customers.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        message="Nenhum resultado para estes filtros."
        action={onClearFilters ? { label: "Limpar filtros", onClick: onClearFilters } : undefined}
      />
    ) : (
      <EmptyState message="Nenhum cliente encontrado." />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>CPF/CNPJ</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell className="font-medium text-foreground">{customer.full_name}</TableCell>
            <TableCell className="text-muted-foreground">{customer.cpf_cnpj}</TableCell>
            <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
            <TableCell className="text-muted-foreground">
              {PERSON_TYPE_LABEL[customer.person_type]}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {customer.user?.email ?? "-"}
            </TableCell>
            <TableCell>
              <Badge variant={customer.is_active ? "success" : "muted"}>
                {customer.is_active ? "Ativo" : "Inativo"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" aria-label="Editar cliente" asChild>
                      <Link href={`/admin/customers/${customer.id}`}>
                        <Pencil className="size-3.5" aria-hidden />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar cliente</TooltipContent>
                </Tooltip>
                <RowActionsMenu
                  actions={[
                    {
                      label: "Excluir cliente",
                      icon: Trash2,
                      variant: "destructive",
                      disabled: deletingId === customer.id,
                      onClick: () => handleDelete(customer),
                    },
                  ]}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
