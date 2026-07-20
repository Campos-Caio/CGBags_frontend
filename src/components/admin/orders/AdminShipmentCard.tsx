"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Truck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  cancelOrderShipmentAdmin,
  getOrderShipmentAdmin,
  retryOrderShipmentAdmin,
} from "@/services/admin.service";
import type { Shipment } from "@/types/shipment";
import { getApiErrorMessage } from "@/utils/apiError";
import { confirmToast } from "@/utils/confirmToast";
import { formatDateTime } from "@/utils/date";
import {
  getCarrierTrackingUrl,
  isShipmentTerminal,
  SHIPMENT_STATUS_BADGE_VARIANT,
  SHIPMENT_STATUS_LABEL,
} from "@/utils/shipment";

// Antes do pedido chegar a um desses status, a compra automatica do frete
// nunca rodou ainda — nao vale a pena mostrar o card so' pra dizer "vazio".
const RELEVANT_ORDER_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"];

interface AdminShipmentCardProps {
  orderId: number;
  orderStatus: string;
}

/** Frete/rastreio do pedido, visao do admin — timeline completa (inclui as
 * etapas internas de compra que o cliente nao ve) + acoes de retry/cancelar. */
export function AdminShipmentCard({ orderId, orderStatus }: AdminShipmentCardProps) {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [isActing, setIsActing] = useState(false);

  async function reload() {
    try {
      const data = await getOrderShipmentAdmin(orderId);
      setShipment(data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível carregar o frete."));
    } finally {
      setStatus("ready");
    }
  }

  useEffect(() => {
    let cancelled = false;
    getOrderShipmentAdmin(orderId)
      .then((data) => {
        if (!cancelled) setShipment(data);
      })
      .catch((error) => {
        if (!cancelled) toast.error(getApiErrorMessage(error, "Não foi possível carregar o frete."));
      })
      .finally(() => {
        if (!cancelled) setStatus("ready");
      });
    return () => {
      cancelled = true;
    };
    // orderStatus tambem entra nas deps: o botao "Marcar como Enviado" (fora
    // deste componente) pode superseder o frete automatico do lado do
    // backend — sem refazer a busca aqui, o card ficaria mostrando o status
    // antigo (ex.: "Etiqueta gerada") contradizendo o badge do pedido.
  }, [orderId, orderStatus]);

  async function handleRetry() {
    setIsActing(true);
    try {
      await retryOrderShipmentAdmin(orderId);
      await reload();
      toast.success("Compra do frete reprocessada.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível tentar novamente."));
    } finally {
      setIsActing(false);
    }
  }

  function handleCancel() {
    confirmToast("Cancelar o frete deste pedido junto ao Melhor Envio?", performCancel, {
      confirmLabel: "Cancelar frete",
    });
  }

  async function performCancel() {
    setIsActing(true);
    try {
      await cancelOrderShipmentAdmin(orderId);
      await reload();
      toast.success("Frete cancelado.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível cancelar o frete."));
    } finally {
      setIsActing(false);
    }
  }

  if (status === "ready" && !shipment && !RELEVANT_ORDER_STATUSES.includes(orderStatus)) {
    return null;
  }

  const carrierTrackingUrl = shipment ? getCarrierTrackingUrl(shipment.tracking_code) : null;
  const canRetry = shipment?.status === "PURCHASE_FAILED";
  const canCancel = shipment !== null && !isShipmentTerminal(shipment.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="size-4" aria-hidden />
          Frete
        </CardTitle>
        {shipment && (
          <CardAction>
            <Badge variant={SHIPMENT_STATUS_BADGE_VARIANT[shipment.status]}>
              {SHIPMENT_STATUS_LABEL[shipment.status]}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {status === "loading" ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Carregando...</p>
        ) : !shipment ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Ainda não processado — a compra automática do frete roda logo após o pagamento.
          </p>
        ) : (
          <>
            {shipment.failure_reason && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {shipment.failure_reason}
              </div>
            )}

            {(shipment.protocol || shipment.tracking_code) && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {shipment.protocol && (
                  <div>
                    <span className="text-xs text-muted-foreground">Protocolo</span>
                    <p className="font-medium text-foreground">{shipment.protocol}</p>
                  </div>
                )}
                {shipment.tracking_code && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      {shipment.carrier_name ?? "Transportadora"} · Rastreio
                    </span>
                    <p className="font-mono font-medium text-foreground">{shipment.tracking_code}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {shipment.label_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={shipment.label_url} target="_blank" rel="noreferrer">
                    Abrir etiqueta
                  </a>
                </Button>
              )}
              {carrierTrackingUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={carrierTrackingUrl} target="_blank" rel="noreferrer">
                    Rastrear
                    <ExternalLink className="size-3" aria-hidden />
                  </a>
                </Button>
              )}
              {canRetry && (
                <Button size="sm" disabled={isActing} onClick={handleRetry}>
                  {isActing ? "Tentando..." : "Tentar novamente"}
                </Button>
              )}
              {canCancel && (
                <Button variant="outline" size="sm" disabled={isActing} onClick={handleCancel}>
                  Cancelar frete
                </Button>
              )}
            </div>

            {shipment.events.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-border pt-3">
                {[...shipment.events].reverse().map((event) => (
                  <div
                    key={`${event.event}-${event.occurred_at}`}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-foreground">{event.label}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDateTime(event.occurred_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
