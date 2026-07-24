import { endOfDay, format, startOfDay, startOfMonth, startOfWeek, startOfYear } from "date-fns";

export type OrderPeriodOption = "all" | "today" | "this_week" | "this_month" | "this_year";

export const ORDER_PERIOD_OPTIONS: OrderPeriodOption[] = [
  "all",
  "today",
  "this_week",
  "this_month",
  "this_year",
];

export const ORDER_PERIOD_LABEL: Record<OrderPeriodOption, string> = {
  all: "Todo o período",
  today: "Hoje",
  this_week: "Essa semana",
  this_month: "Este mês",
  this_year: "Este ano",
};

export interface OrderPeriodRange {
  start?: string;
  end?: string;
}

const DATE_FORMAT = "yyyy-MM-dd";

/** Calcula o intervalo [start, end] (data, sem hora) correspondente a uma opção de período pré-definida — "all" não filtra por data. */
export function getOrderPeriodRange(option: OrderPeriodOption): OrderPeriodRange {
  if (option === "all") return {};

  const now = new Date();
  const end = format(endOfDay(now), DATE_FORMAT);

  switch (option) {
    case "today":
      return { start: format(startOfDay(now), DATE_FORMAT), end };
    case "this_week":
      return { start: format(startOfWeek(now), DATE_FORMAT), end };
    case "this_month":
      return { start: format(startOfMonth(now), DATE_FORMAT), end };
    case "this_year":
      return { start: format(startOfYear(now), DATE_FORMAT), end };
  }
}
