import { api } from "@/lib/api";
import type { AdminDashboard, MelhorEnvioBalance } from "@/types/admin";
import type { Shipment } from "@/types/shipment";

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const response = await api.get<AdminDashboard>("/admin/dashboard");
  return response.data;
}

// `events` normalizado pra [] em todo retorno: o backend do retry/cancel
// (ShipmentRead) nunca manda esse campo de proposito (evita carregar a
// relacao so' pra devolver uma resposta que ninguem le), e uma versao antiga
// do backend rodando sem reiniciar tambem pode omitir o campo no GET — sem
// isso, `shipment.events.length` quebra a tela inteira do pedido.
function normalizeShipment<T extends Shipment | null>(shipment: T): T {
  if (!shipment) return shipment;
  return { ...shipment, events: shipment.events ?? [] };
}

export async function getOrderShipmentAdmin(orderId: number): Promise<Shipment | null> {
  const response = await api.get<Shipment | null>(`/admin/orders/${orderId}/shipment`);
  return normalizeShipment(response.data);
}

export async function retryOrderShipmentAdmin(orderId: number): Promise<Shipment> {
  const response = await api.post<Shipment>(`/admin/orders/${orderId}/shipment/retry`);
  return normalizeShipment(response.data);
}

export async function cancelOrderShipmentAdmin(orderId: number): Promise<Shipment> {
  const response = await api.post<Shipment>(`/admin/orders/${orderId}/shipment/cancel`);
  return normalizeShipment(response.data);
}

export async function getMelhorEnvioBalance(): Promise<MelhorEnvioBalance> {
  const response = await api.get<MelhorEnvioBalance>("/admin/melhor-envio/balance");
  return response.data;
}
