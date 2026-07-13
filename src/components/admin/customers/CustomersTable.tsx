"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
}

export function CustomersTable({ customers, onCustomersChange }: CustomersTableProps) {
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
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">Nenhum cliente encontrado.</p>
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
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  customer.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {customer.is_active ? "Ativo" : "Inativo"}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1.5">
                <Button variant="outline" size="sm" aria-label="Ver cliente" asChild>
                  <Link href={`/admin/customers/${customer.id}`}>
                    <Eye className="size-3.5" aria-hidden />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Excluir cliente"
                  disabled={deletingId === customer.id}
                  onClick={() => handleDelete(customer)}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
