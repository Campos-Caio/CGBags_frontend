export interface AuditLog {
  id: number;
  user_id: number | null;
  entity: string;
  entity_id: number | null;
  action: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
