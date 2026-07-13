"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { DefinitionRow } from "@/components/ui/definition-row";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { getMyOrderById, payOrder } from "@/services/order.service";
import type { Order } from "@/types/order";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency } from "@/utils/currency";

type PageStatus = "loading" | "ready" | "error";

const MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => String(currentYear + i));
const INSTALLMENTS = Array.from({ length: 12 }, (_, i) => i + 1);

function maskCardNumber(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})(?=.)/g, "$1 ");
}

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams<{ orderId: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumberDisplay, setCardNumberDisplay] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [installments, setInstallments] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    async function loadOrder() {
      await Promise.resolve();
      if (cancelled) return;

      const orderId = Number(params.orderId);
      if (!Number.isInteger(orderId)) {
        setPageStatus("error");
        return;
      }

      try {
        const data = await getMyOrderById(orderId);
        if (cancelled) return;
        if (data.status !== "PENDING_PAYMENT" && data.status !== "PAYMENT_FAILED") {
          router.replace(`/account/orders/${data.id}`);
          return;
        }
        setOrder(data);
        setPageStatus("ready");
      } catch {
        if (!cancelled) setPageStatus("error");
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, params.orderId, router]);

  function handleCardNumberChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(digits);
    setCardNumberDisplay(maskCardNumber(digits));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!order) return;

    setIsSubmitting(true);
    try {
      await payOrder(order.id, {
        cardholder_name: cardholderName,
        card_number: cardNumber,
        expiration_month: parseInt(expiryMonth),
        expiration_year: parseInt(expiryYear),
        security_code: cvv,
        installments,
      });
      toast.success("Pagamento aprovado! Seu pedido está confirmado.");
      router.push(`/account/orders/${order.id}`);
    } catch (error) {
      setIsSubmitting(false);

      // Se essa recusa esgotou o limite de tentativas, o backend cancela o
      // pedido automaticamente — nesse caso o formulario nao serve mais para
      // nada (nova tentativa sempre falha com 409). Confere o status real do
      // pedido antes de decidir qual toast mostrar, em vez de comparar texto
      // de mensagem (fragil caso a redacao do backend mude).
      let refreshed: Order | null = null;
      try {
        refreshed = await getMyOrderById(order.id);
      } catch {
        // ignora — segue com o toast de recusa comum abaixo
      }

      const wasAutoCanceled =
        refreshed !== null &&
        refreshed.status !== "PENDING_PAYMENT" &&
        refreshed.status !== "PAYMENT_FAILED";

      if (wasAutoCanceled) {
        toast.error(getApiErrorMessage(error, "Este pedido foi cancelado automaticamente."));
        router.replace(`/account/orders/${refreshed!.id}`);
        return;
      }

      toast.error(
        getApiErrorMessage(
          error,
          "Pagamento não autorizado. Verifique os dados do cartão ou tente outro cartão."
        )
      );
    }
  }

  if (authLoading || !isAuthenticated || pageStatus === "loading") {
    return (
      <Container className="py-16 text-center text-muted-foreground">Carregando...</Container>
    );
  }

  if (pageStatus === "error" || !order) {
    return (
      <Container className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Pedido não encontrado
        </h1>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Ver meus pedidos
        </Link>
      </Container>
    );
  }

  const totalPerInstallment = (Number(order.total) / installments).toFixed(2);

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/account/orders"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Ver meus pedidos
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              Pagamento
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Pedido #{order.id}</p>
          </div>
          {order.status === "PAYMENT_FAILED" && (
            <span className="rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive">
              Pagamento anterior recusado — tente novamente
            </span>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do pedido</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <p className="font-medium text-foreground">{formatCurrency(item.total_price)}</p>
                </div>
              ))}
              <DefinitionRow size="lg" label="Subtotal" value={formatCurrency(order.subtotal)} />
              <DefinitionRow size="lg" label="Frete" value={formatCurrency(order.shipping_cost)} />
              {Number(order.discount) > 0 && (
                <DefinitionRow
                  size="lg"
                  label="Desconto"
                  value={`- ${formatCurrency(order.discount)}`}
                />
              )}
              <DefinitionRow size="lg" label="Total" value={formatCurrency(order.total)} />
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="size-4" aria-hidden />
                  Dados do cartão
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cardholderName" className="text-sm font-medium text-foreground">
                    Nome no cartão
                  </label>
                  <Input
                    id="cardholderName"
                    autoComplete="cc-name"
                    placeholder="Como aparece no cartão"
                    required
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cardNumber" className="text-sm font-medium text-foreground">
                    Número do cartão
                  </label>
                  <Input
                    id="cardNumber"
                    autoComplete="cc-number"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    required
                    value={cardNumberDisplay}
                    onChange={handleCardNumberChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-foreground">Validade</span>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        aria-label="Mês de validade"
                        required
                        value={expiryMonth}
                        onChange={(e) => setExpiryMonth(e.target.value)}
                        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <option value="" disabled>MM</option>
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        aria-label="Ano de validade"
                        required
                        value={expiryYear}
                        onChange={(e) => setExpiryYear(e.target.value)}
                        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <option value="" disabled>AAAA</option>
                        {YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="cvv" className="text-sm font-medium text-foreground">
                      CVV
                    </label>
                    <Input
                      id="cvv"
                      autoComplete="cc-csc"
                      inputMode="numeric"
                      placeholder="123"
                      required
                      minLength={3}
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="installments" className="text-sm font-medium text-foreground">
                    Parcelas
                  </label>
                  <select
                    id="installments"
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {INSTALLMENTS.map((n) => (
                      <option key={n} value={n}>
                        {n}× de {formatCurrency(Number(order.total) / n)} sem juros
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting
                  ? "Processando pagamento..."
                  : installments > 1
                    ? `Pagar ${installments}× de ${formatCurrency(totalPerInstallment)}`
                    : `Pagar ${formatCurrency(order.total)}`}
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3" aria-hidden />
                Pagamento seguro via e.Rede
              </p>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
}
