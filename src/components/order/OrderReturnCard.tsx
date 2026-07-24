import { Undo2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DefinitionRow } from "@/components/ui/definition-row";
import type { OrderReturn } from "@/types/orderReturn";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";
import { RETURN_STATUS_BADGE_VARIANT, RETURN_STATUS_LABEL } from "@/utils/returnStatus";

interface OrderReturnCardProps {
  orderReturn: OrderReturn;
}

/** Status da devolução pós-entrega (Art. 49 CDC) solicitada pelo cliente —
 * o reembolso já foi processado no momento em que essa devolução existe. */
export function OrderReturnCard({ orderReturn }: OrderReturnCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Undo2 className="size-4" aria-hidden />
          Devolução
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Badge variant={RETURN_STATUS_BADGE_VARIANT[orderReturn.status]} className="self-start">
          {RETURN_STATUS_LABEL[orderReturn.status]}
        </Badge>

        {orderReturn.return_code && (
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">
              Código de devolução (apresente em uma agência dos Correios)
            </p>
            <p className="font-mono text-sm font-medium text-foreground">
              {orderReturn.return_code}
            </p>
          </div>
        )}

        <div className="flex flex-col divide-y divide-border">
          <DefinitionRow
            label="Valor reembolsado"
            value={formatCurrency(orderReturn.refunded_amount)}
          />
          <DefinitionRow label="Solicitada em" value={formatDateTime(orderReturn.requested_at)} />
        </div>
      </CardContent>
    </Card>
  );
}
