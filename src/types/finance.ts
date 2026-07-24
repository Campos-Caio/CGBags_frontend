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
  canceled_orders_count: number;
  canceled_orders_total: string;
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

export type FinanceEntryType = "SALE" | "REFUND";

export interface FinanceEntry {
  id: number;
  order_id: number;
  payment_id: number;
  type: FinanceEntryType;
  gross_amount: string;
  discount_amount: string;
  gateway_fee: string;
  shipping_cost: string;
  net_amount: string;
  occurred_at: string;
}

export interface CanceledOrder {
  id: number;
  customer_name: string;
  customer_email: string;
  total: string;
  status: "CANCELED";
  created_at: string;
  updated_at: string;
}
