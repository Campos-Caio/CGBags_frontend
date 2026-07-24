import { api } from "@/lib/api";
import type { ContactMessage, ContactMessageStatus } from "@/types/contact";

export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export async function sendContactMessage(data: ContactMessageInput): Promise<ContactMessage> {
  const response = await api.post<ContactMessage>("/contact", data);
  return response.data;
}

// --- Rotas administrativas ---

export interface ListContactMessagesAdminParams {
  message_status?: ContactMessageStatus;
  skip?: number;
  limit?: number;
}

export async function listContactMessagesAdmin(
  params?: ListContactMessagesAdminParams
): Promise<ContactMessage[]> {
  const response = await api.get<ContactMessage[]>("/admin/contact-messages", { params });
  return response.data;
}

export async function resolveContactMessage(id: number): Promise<ContactMessage> {
  const response = await api.patch<ContactMessage>(`/admin/contact-messages/${id}/resolve`);
  return response.data;
}
