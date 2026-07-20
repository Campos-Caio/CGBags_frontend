"use client";

import { useState } from "react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminResource } from "@/hooks/useAdminResource";
import { getMonthlyRevenue } from "@/services/finance.service";
import { formatCurrency } from "@/utils/currency";

const MONTH_LABEL = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function buildYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear - 1, currentYear - 2];
}

/** Receita bruta x líquida por mês de um ano — barras pareadas, com o ano selecionável. */
export function MonthlyRevenueChart() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const yearOptions = buildYearOptions();

  const { data, status } = useAdminResource({
    fetch: () => getMonthlyRevenue(year),
    deps: [year],
    errorMessage: "Não foi possível carregar a receita mensal.",
  });

  const monthsByNumber = new Map((data?.months ?? []).map((item) => [item.month, item]));
  const maxGross = Math.max(1, ...(data?.months ?? []).map((item) => Number(item.gross_revenue)));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita mensal</CardTitle>
        <CardAction>
          <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
            <SelectTrigger className="w-24" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        {status === "loading" ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-muted-foreground/30" aria-hidden />
                Receita bruta
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary" aria-hidden />
                Receita líquida
              </span>
            </div>
            <div className="flex h-40 items-end gap-2">
              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => {
                const item = monthsByNumber.get(month);
                const gross = item ? Number(item.gross_revenue) : 0;
                const net = item ? Number(item.net_revenue) : 0;
                return (
                  <div key={month} className="group relative flex flex-1 flex-col items-center gap-1">
                    <div className="relative flex h-32 w-full items-end justify-center gap-0.5">
                      <div
                        className="w-1/2 rounded-t-sm bg-muted-foreground/25"
                        style={{ height: `${(gross / maxGross) * 100}%` }}
                      />
                      <div
                        className="w-1/2 rounded-t-sm bg-primary"
                        style={{ height: `${(net / maxGross) * 100}%` }}
                      />
                      <div className="pointer-events-none absolute bottom-full mb-1.5 hidden whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md ring-1 ring-border group-hover:block">
                        {formatCurrency(net)} líq. · {formatCurrency(gross)} bruta
                      </div>
                    </div>
                    <span className="text-[0.65rem] text-muted-foreground">{MONTH_LABEL[month - 1]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
