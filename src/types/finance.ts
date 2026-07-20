export type PaymentMethod = "CREDIT_CARD" | "DEBIT_CARD" | "PIX" | "MANUAL";

export interface FinanceDashboard {
  period_start: string;
  period_end: string;
  paid_orders_count: number;
  gross_revenue: string;
  net_revenue: string;
  effective_net_revenue: string;
  total_shipping: string;
  total_fees: string;
  total_discounts: string;
  average_ticket: string;
  total_refunds: string;
}

export interface MonthlyRevenueItem {
  month: number;
  year: number;
  gross_revenue: string;
  net_revenue: string;
  orders_count: number;
}

export interface MonthlyRevenue {
  year: number;
  months: MonthlyRevenueItem[];
}

export interface SalesByPaymentMethodItem {
  payment_method: PaymentMethod;
  count: number;
  gross_revenue: string;
}

export interface SalesByPaymentMethod {
  items: SalesByPaymentMethodItem[];
  total_gross: string;
}
