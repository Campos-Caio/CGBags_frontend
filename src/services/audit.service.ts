import { api } from "@/lib/api";
import type { AuditLog } from "@/types/audit";

export interface ListAuditLogsParams {
  entity?: string;
  action?: string;
  user_id?: number;
  entity_id?: number;
  start?: string;
  end?: string;
  skip?: number;
  limit?: number;
}

export async function listAuditLogs(params?: ListAuditLogsParams): Promise<AuditLog[]> {
  const response = await api.get<AuditLog[]>("/audit/logs", { params });
  return response.data;
}
