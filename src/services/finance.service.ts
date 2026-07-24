import { api } from "@/lib/api";
import type {
  CanceledOrder,
  FinanceDashboard,
  FinanceEntry,
  MonthlyRevenue,
  SalesByPaymentMethod,
} from "@/types/finance";

export async function getFinanceDashboard(start: string, end: string): Promise<FinanceDashboard> {
  const response = await api.get<FinanceDashboard>("/finance/dashboard", { params: { start, end } });
  return response.data;
}

export async function getMonthlyRevenue(year: number): Promise<MonthlyRevenue> {
  const response = await api.get<MonthlyRevenue>("/finance/reports/revenue/monthly", { params: { year } });
  return response.data;
}

export async function getSalesByPaymentMethod(
  start: string,
  end: string
): Promise<SalesByPaymentMethod> {
  const response = await api.get<SalesByPaymentMethod>("/finance/reports/sales/by-payment-method", {
    params: { start, end },
  });
  return response.data;
}

export interface FinanceReportParams {
  start: string;
  end: string;
  skip?: number;
  limit?: number;
}

export async function getSalesReport(params: FinanceReportParams): Promise<FinanceEntry[]> {
  const response = await api.get<FinanceEntry[]>("/finance/reports/sales", { params });
  return response.data;
}

export async function getRefundsReport(params: FinanceReportParams): Promise<FinanceEntry[]> {
  const response = await api.get<FinanceEntry[]>("/finance/reports/refunds", { params });
  return response.data;
}

export async function getCanceledOrdersReport(
  params: FinanceReportParams
): Promise<CanceledOrder[]> {
  const response = await api.get<CanceledOrder[]>("/finance/reports/canceled", { params });
  return response.data;
}
