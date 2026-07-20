"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPixChargeStatus, payOrderPix, type PixCharge } from "@/services/order.service";
import { getApiErrorMessage } from "@/utils/apiError";

const POLL_INTERVAL_MS = 4000;

interface PixPaymentPanelProps {
  orderId: number;
  onApproved: () => void;
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function PixPaymentPanel({ orderId, onApproved }: PixPaymentPanelProps) {
  const [charge, setCharge] = useState<PixCharge | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Descarta respostas de chamadas antigas caso duas gerações concorram (ex.:
  // o duplo-efeito de montagem do React Strict Mode em dev, ou um duplo
  // clique em "Tentar novamente") — sem isso, uma resposta lenta que falhou
  // pode sobrescrever o estado de uma chamada mais nova que teve sucesso.
  const latestRequestId = useRef(0);

  const generate = useCallback(async () => {
    const requestId = ++latestRequestId.current;
    setIsGenerating(true);
    setError(null);
    setCopied(false);
    try {
      const data = await payOrderPix(orderId);
      if (latestRequestId.current !== requestId) return;
      setCharge(data);
    } catch (err) {
      if (latestRequestId.current !== requestId) return;
      setError(getApiErrorMessage(err, "Não foi possível gerar o QR Code Pix."));
    } finally {
      if (latestRequestId.current === requestId) setIsGenerating(false);
    }
  }, [orderId]);

  // Gera o primeiro QR Code assim que o cliente escolhe Pix.
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (cancelled) return;
      await generate();
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [generate]);

  const isExpired =
    charge?.status === "Pending" && charge.expires_at !== null && new Date(charge.expires_at).getTime() <= now;

  // Relogio local só' pra atualizar o contador regressivo — nao decide nada
  // sozinho, so' controla quando a UI passa a mostrar "expirado".
  useEffect(() => {
    if (!charge || charge.status !== "Pending" || !charge.expires_at) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [charge]);

  // Polling: fallback enquanto o webhook da e.Rede nao confirma (ou nao esta
  // configurado). Para assim que o QR sair de Pending ou expirar localmente.
  useEffect(() => {
    if (!charge || charge.status !== "Pending" || isExpired) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const data = await getPixChargeStatus(orderId);
        if (cancelled) return;
        setCharge(data);
      } catch {
        // Falha de rede pontual: so' tenta de novo no proximo ciclo, sem
        // quebrar a experiencia com um toast a cada tentativa.
      } finally {
        if (!cancelled) timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [charge, isExpired, orderId]);

  const onApprovedRef = useRef(onApproved);
  useEffect(() => {
    onApprovedRef.current = onApproved;
  }, [onApproved]);

  useEffect(() => {
    if (charge?.status === "Approved") {
      onApprovedRef.current();
    }
  }, [charge?.status]);

  async function handleCopy() {
    if (!charge?.qr_code_data) return;
    try {
      await navigator.clipboard.writeText(charge.qr_code_data);
      setCopied(true);
      toast.success("Código Pix copiado!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Não foi possível copiar o código. Copie manualmente.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="size-4" aria-hidden />
          Pagamento via Pix
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 text-center">
        {isGenerating && !charge && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
          </div>
        )}

        {error && !isGenerating && (
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button type="button" variant="outline" size="sm" onClick={generate}>
              Tentar novamente
            </Button>
          </div>
        )}

        {charge && !error && charge.status === "Pending" && !isExpired && (
          <>
            <div className="rounded-xl border border-border bg-background p-3">
              {charge.qr_code_image ? (
                // next/image nao se aplica bem aqui: e' um PNG base64 gerado
                // sob demanda pela e.Rede (efemero, nunca um asset remoto ou
                // estatico), sem ganho real de otimizacao/srcset.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`data:image/png;base64,${charge.qr_code_image}`}
                  alt="QR Code para pagamento Pix"
                  width={220}
                  height={220}
                  className="size-[220px]"
                />
              ) : (
                <div className="flex size-[220px] items-center justify-center text-xs text-muted-foreground">
                  QR Code indisponível
                </div>
              )}
            </div>

            {charge.expires_at && (
              <p className="text-xs text-muted-foreground">
                Expira em{" "}
                <span className="font-medium text-foreground">
                  {formatCountdown(new Date(charge.expires_at).getTime() - now)}
                </span>
              </p>
            )}

            {charge.qr_code_data && (
              <div className="flex w-full flex-col gap-1.5 text-left">
                <span className="text-sm font-medium text-foreground">Pix Copia e Cola</span>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={charge.qr_code_data}
                    onFocus={(e) => e.currentTarget.select()}
                    className="h-8 w-full min-w-0 truncate rounded-lg border border-input bg-transparent px-2.5 text-xs text-muted-foreground outline-none"
                  />
                  <Button type="button" variant="outline" size="icon-sm" onClick={handleCopy} aria-label="Copiar código Pix">
                    {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" aria-hidden />
              Aguardando confirmação do pagamento...
            </div>
          </>
        )}

        {charge && !error && (isExpired || charge.status === "Canceled") && (
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-sm text-muted-foreground">
              {isExpired ? "Este QR Code expirou." : "Este QR Code foi cancelado."}
            </p>
            <Button type="button" variant="outline" size="sm" onClick={generate} disabled={isGenerating}>
              {isGenerating ? "Gerando..." : "Gerar novo QR Code"}
            </Button>
          </div>
        )}

        {charge?.status === "Approved" && (
          <div className="flex flex-col items-center gap-2 py-4">
            <Check className="size-6 text-secondary-foreground" aria-hidden />
            <p className="text-sm font-medium text-foreground">Pagamento aprovado!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { PixPaymentPanel };
