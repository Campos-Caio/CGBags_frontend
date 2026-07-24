export type ContactMessageStatus = "NEW" | "RESOLVED";

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: ContactMessageStatus;
  created_at: string;
  updated_at: string;
}
