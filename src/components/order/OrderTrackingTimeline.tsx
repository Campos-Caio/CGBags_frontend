import { ExternalLink, Truck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrderTracking } from "@/types/tracking";
import { formatDateTime } from "@/utils/date";

interface OrderTrackingTimelineProps {
  tracking: OrderTracking;
}

/** Rastreio do pedido pro cliente — codigo/link da transportadora + linha do
 * tempo (mais recente primeiro). So' renderiza quando ha algo pra mostrar. */
export function OrderTrackingTimeline({ tracking }: OrderTrackingTimelineProps) {
  if (tracking.events.length === 0 && !tracking.tracking_code) {
    return null;
  }

  const timelineEvents = [...tracking.events].reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="size-4" aria-hidden />
          Rastreio
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {tracking.tracking_code && (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">
                {tracking.carrier_name ?? "Transportadora"} · Código de rastreio
              </span>
              <span className="font-mono text-sm font-medium text-foreground">
                {tracking.tracking_code}
              </span>
            </div>
            {tracking.carrier_tracking_url && (
              <a
                href={tracking.carrier_tracking_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-foreground hover:underline"
              >
                Rastrear
                <ExternalLink className="size-3" aria-hidden />
              </a>
            )}
          </div>
        )}

        {timelineEvents.length > 0 && (
          <ol className="flex flex-col gap-4">
            {timelineEvents.map((event, index) => (
              <li key={`${event.event}-${event.occurred_at}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`mt-1 size-2.5 shrink-0 rounded-full ${
                      index === 0 ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                    aria-hidden
                  />
                  {index < timelineEvents.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-border" aria-hidden />
                  )}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-medium text-foreground">{event.label}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(event.occurred_at)}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
