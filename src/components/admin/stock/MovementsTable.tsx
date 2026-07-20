import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StockMovement } from "@/types/stock";
import { formatDateTime } from "@/utils/date";
import { STOCK_MOVEMENT_TYPE_BADGE_VARIANT, STOCK_MOVEMENT_TYPE_LABEL } from "@/utils/stockMovement";

interface MovementsTableProps {
  movements: StockMovement[];
}

export function MovementsTable({ movements }: MovementsTableProps) {
  if (movements.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma movimentação encontrada.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Produto</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Quantidade</TableHead>
          <TableHead>Antes → Depois</TableHead>
          <TableHead>Motivo</TableHead>
          <TableHead>Responsável</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((movement) => {
          const delta = movement.quantity_after - movement.quantity_before;
          return (
            <TableRow key={movement.id}>
              <TableCell className="text-muted-foreground">
                {formatDateTime(movement.created_at)}
              </TableCell>
              <TableCell>
                <span className="font-medium text-foreground">
                  {movement.product_name}
                  {movement.variant_label ? ` — ${movement.variant_label}` : ""}
                </span>
                <span className="block text-xs text-muted-foreground">{movement.sku}</span>
              </TableCell>
              <TableCell>
                <Badge variant={STOCK_MOVEMENT_TYPE_BADGE_VARIANT[movement.movement_type]}>
                  {STOCK_MOVEMENT_TYPE_LABEL[movement.movement_type]}
                </Badge>
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {delta >= 0 ? "+" : ""}
                {delta}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {movement.quantity_before} → {movement.quantity_after}
              </TableCell>
              <TableCell className="text-muted-foreground">{movement.reason ?? "-"}</TableCell>
              <TableCell className="text-muted-foreground">{movement.created_by_email}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
