import Link from "next/link";

import { EmptyState } from "@/components/admin/feedback/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FinanceEntry } from "@/types/finance";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";

interface FinanceEntriesTableProps {
  entries: FinanceEntry[];
  /** Muda só a mensagem do estado vazio — "vendas" ou "reembolsos". */
  emptyLabel: string;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

/** Tabela compartilhada por vendas e reembolsos (mesmo formato de FinanceEntry). */
export function FinanceEntriesTable({
  entries,
  emptyLabel,
  hasActiveFilters = false,
  onClearFilters,
}: FinanceEntriesTableProps) {
  if (entries.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        message={`Nenhum resultado para estes filtros.`}
        action={onClearFilters ? { label: "Limpar filtros", onClick: onClearFilters } : undefined}
      />
    ) : (
      <EmptyState message={`Nenhuma ${emptyLabel} encontrada neste período.`} />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pedido</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Valor bruto</TableHead>
          <TableHead>Desconto</TableHead>
          <TableHead>Frete</TableHead>
          <TableHead>Taxa gateway</TableHead>
          <TableHead>Valor líquido</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="font-medium text-foreground">
              <Link href={`/admin/orders/${entry.order_id}`} className="hover:underline">
                #{entry.order_id}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">{formatDateTime(entry.occurred_at)}</TableCell>
            <TableCell className="text-muted-foreground">{formatCurrency(entry.gross_amount)}</TableCell>
            <TableCell className="text-muted-foreground">{formatCurrency(entry.discount_amount)}</TableCell>
            <TableCell className="text-muted-foreground">{formatCurrency(entry.shipping_cost)}</TableCell>
            <TableCell className="text-muted-foreground">{formatCurrency(entry.gateway_fee)}</TableCell>
            <TableCell className="font-medium text-foreground">{formatCurrency(entry.net_amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
