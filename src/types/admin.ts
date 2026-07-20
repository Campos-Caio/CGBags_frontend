import type { OrderStatus } from "@/types/order";

export interface RecentOrder {
  id: number;
  customer_name: string;
  total: string;
  status: OrderStatus;
  created_at: string;
}

export interface AdminDashboard {
  total_users: number;
  total_customers: number;
  total_products: number;
  total_orders: number;
  pending_orders: number;
  paid_orders: number;
  canceled_orders: number;
  orders_awaiting_shipment: number;
  low_stock_count: number;
  out_of_stock_count: number;
  today_gross_revenue: string;
  today_net_revenue: string;
  recent_orders: RecentOrder[];
}
