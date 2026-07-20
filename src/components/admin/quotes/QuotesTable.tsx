import Link from "next/link";

import { EmptyState } from "@/components/admin/feedback/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Customer } from "@/types/customer";
import type { Product } from "@/types/product";
import type { CustomQuoteRequest } from "@/types/quote";
import { formatDateTime } from "@/utils/date";
import { QUOTE_STATUS_BADGE_VARIANT, QUOTE_STATUS_LABEL } from "@/utils/quoteStatus";

interface QuotesTableProps {
  quotes: CustomQuoteRequest[];
  products: Product[];
  customers: Customer[];
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export function QuotesTable({
  quotes,
  products,
  customers,
  hasActiveFilters = false,
  onClearFilters,
}: QuotesTableProps) {
  function productName(productId: number): string {
    return products.find((p) => p.id === productId)?.name ?? "-";
  }

  function customerName(customerId: number): string {
    return customers.find((c) => c.id === customerId)?.full_name ?? "-";
  }

  if (quotes.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        message="Nenhum resultado para estes filtros."
        action={onClearFilters ? { label: "Limpar filtros", onClick: onClearFilters } : undefined}
      />
    ) : (
      <EmptyState message="Nenhuma solicitação de orçamento encontrada." />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Produto</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quotes.map((quote) => (
          <TableRow key={quote.id}>
            <TableCell className="text-muted-foreground">#{quote.id}</TableCell>
            <TableCell className="font-medium text-foreground">
              {customerName(quote.customer_id)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {productName(quote.product_id)}
            </TableCell>
            <TableCell>
              <Badge variant={QUOTE_STATUS_BADGE_VARIANT[quote.status]}>
                {QUOTE_STATUS_LABEL[quote.status]}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDateTime(quote.created_at)}
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-3">
                {quote.order_id !== null && (
                  <Link
                    href={`/admin/orders/${quote.order_id}`}
                    className="text-sm font-medium text-foreground hover:underline"
                  >
                    Ver pedido #{quote.order_id}
                  </Link>
                )}
                <Link
                  href={`/admin/quotes/${quote.id}`}
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  Ver detalhes
                </Link>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
