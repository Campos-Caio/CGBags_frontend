import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SalesByPaymentMethod } from "@/types/finance";
import { formatCurrency } from "@/utils/currency";
import { PAYMENT_METHOD_LABEL } from "@/utils/paymentMethod";

const BAR_COLOR_CLASS = ["bg-primary", "bg-chart-2", "bg-chart-3", "bg-chart-4"];

interface PaymentMethodBreakdownProps {
  data: SalesByPaymentMethod;
}

/** Ranking de vendas por forma de pagamento — barra horizontal por linha, identidade sempre via label, nunca só cor. */
export function PaymentMethodBreakdown({ data }: PaymentMethodBreakdownProps) {
  const sorted = [...data.items].sort((a, b) => Number(b.gross_revenue) - Number(a.gross_revenue));
  const maxValue = Math.max(1, ...sorted.map((item) => Number(item.gross_revenue)));
  const totalGross = Number(data.total_gross);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas por forma de pagamento</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {sorted.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma venda no período.</p>
        ) : (
          sorted.map((item, index) => {
            const value = Number(item.gross_revenue);
            const percentage = totalGross > 0 ? (value / totalGross) * 100 : 0;
            return (
              <div key={item.payment_method} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium text-foreground">
                    {PAYMENT_METHOD_LABEL[item.payment_method]}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatCurrency(value)} · {percentage.toFixed(0)}% · {item.count}{" "}
                    {item.count === 1 ? "pedido" : "pedidos"}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${BAR_COLOR_CLASS[index % BAR_COLOR_CLASS.length]}`}
                    style={{ width: `${(value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
