import { endOfDay, format, startOfDay, startOfMonth, startOfYear, subDays } from "date-fns";

export type FinancePeriodOption = "today" | "last_30_days" | "this_month" | "this_year";

export const FINANCE_PERIOD_OPTIONS: FinancePeriodOption[] = [
  "today",
  "last_30_days",
  "this_month",
  "this_year",
];

export const FINANCE_PERIOD_LABEL: Record<FinancePeriodOption, string> = {
  today: "Hoje",
  last_30_days: "Últimos 30 dias",
  this_month: "Este mês",
  this_year: "Este ano",
};

export interface FinancePeriodRange {
  start: string;
  end: string;
}

const DATE_FORMAT = "yyyy-MM-dd";

/** Calcula o intervalo [start, end] (data, sem hora) correspondente a uma opção de período pré-definida. */
export function getFinancePeriodRange(option: FinancePeriodOption): FinancePeriodRange {
  const now = new Date();
  const end = format(endOfDay(now), DATE_FORMAT);

  switch (option) {
    case "today":
      return { start: format(startOfDay(now), DATE_FORMAT), end };
    case "last_30_days":
      return { start: format(subDays(now, 29), DATE_FORMAT), end };
    case "this_month":
      return { start: format(startOfMonth(now), DATE_FORMAT), end };
    case "this_year":
      return { start: format(startOfYear(now), DATE_FORMAT), end };
  }
}
