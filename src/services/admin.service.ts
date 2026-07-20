import { api } from "@/lib/api";
import type { AdminDashboard } from "@/types/admin";

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const response = await api.get<AdminDashboard>("/admin/dashboard");
  return response.data;
}
