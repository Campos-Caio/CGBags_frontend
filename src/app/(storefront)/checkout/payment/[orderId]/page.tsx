"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, CreditCard, Landmark, Lock, QrCode } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DefinitionRow } from "@/components/ui/definition-row";
import { Input } from "@/components/ui/input";
import { PixPaymentPanel } from "@/components/order/PixPaymentPanel";
import { getMyOrderById, payOrder, type CardPaymentMethod } from "@/services/order.service";
import type { Order } from "@/types/order";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency } from "@/utils/currency";

type PageStatus = "loading" | "ready" | "error";
type PaymentMethod = CardPaymentMethod | "PIX";
type Step = "select" | "pay";

// Da' tempo do cliente ler o toast/mensagem de aprovacao antes de tirar ele
// da tela — redirecionar na hora (como era antes) corta a confirmacao pela
// metade.
const POST_PAYMENT_REDIRECT_DELAY_MS = 3000;

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CREDIT_CARD: "Crédito",
  DEBIT_CARD: "Débito",
  PIX: "Pix",
};

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

  const [order, setOrder] = useState<Order | null>(null);
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");

  // Escolher a forma de pagamento e' so' uma preferencia — nao pode ter
  // efeito colateral (gerar QR Pix, por exemplo) antes do cliente confirmar
  // explicitamente com "Continuar". Sem essa etapa, so' clicar no card do
  // Pix (mesmo sem querer, so pra comparar as opcoes) ja consumia uma
  // tentativa de pagamento e gerava uma cobranca real no gateway.
  const [step, setStep] = useState<Step>("select");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CREDIT_CARD");

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumberDisplay, setCardNumberDisplay] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [installments, setInstallments] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentApproved, setPaymentApproved] = useState(false);

  useEffect(() => {
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
  }, [params.orderId, router]);

  function handleCardNumberChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(digits);
    setCardNumberDisplay(maskCardNumber(digits));
  }

  function handlePaymentMethodChange(method: PaymentMethod) {
    setPaymentMethod(method);
    // Debito nao tem parcelamento — evita deixar um valor > 1 "escondido"
    // de uma selecao anterior em credito.
    if (method === "DEBIT_CARD") setInstallments(1);
  }

  async function handleCardSubmit(event: FormEvent) {
    event.preventDefault();
    if (!order || paymentMethod === "PIX") return;

    setIsSubmitting(true);
    try {
      await payOrder(order.id, {
        cardholder_name: cardholderName,
        card_number: cardNumber,
        expiration_month: parseInt(expiryMonth),
        expiration_year: parseInt(expiryYear),
        security_code: cvv,
        installments: paymentMethod === "DEBIT_CARD" ? 1 : installments,
        payment_method: paymentMethod,
      });
      setIsSubmitting(false);
      setPaymentApproved(true);
      toast.success("Pagamento aprovado! Seu pedido está confirmado.");
      setTimeout(() => router.push("/account/orders"), POST_PAYMENT_REDIRECT_DELAY_MS);
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

  function handlePixApproved() {
    if (!order) return;
    setPaymentApproved(true);
    toast.success("Pagamento aprovado! Seu pedido está confirmado.");
    setTimeout(() => router.push("/account/orders"), POST_PAYMENT_REDIRECT_DELAY_MS);
  }

  if (pageStatus === "loading") {
    return <p className="py-16 text-center text-muted-foreground">Carregando...</p>;
  }

  if (pageStatus === "error" || !order) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
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
      </div>
    );
  }

  const totalPerInstallment = (Number(order.total) / installments).toFixed(2);

  return (
    <>
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

          {paymentApproved ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <Check className="size-8 text-secondary-foreground" aria-hidden />
                <p className="font-medium text-foreground">
                  Pagamento aprovado! Seu pedido está confirmado.
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecionando para seus pedidos...
                </p>
              </CardContent>
            </Card>
          ) : step === "select" ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Forma de pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {(
                      [
                        { value: "CREDIT_CARD", label: "Crédito", Icon: CreditCard },
                        { value: "DEBIT_CARD", label: "Débito", Icon: Landmark },
                        { value: "PIX", label: "Pix", Icon: QrCode },
                      ] as const
                    ).map(({ value, label, Icon }) => (
                      <label
                        key={value}
                        className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors ${
                          paymentMethod === value
                            ? "border-ring bg-muted/30"
                            : "border-border hover:bg-muted/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={value}
                          checked={paymentMethod === value}
                          onChange={() => handlePaymentMethodChange(value)}
                          className="sr-only"
                        />
                        <Icon className="size-5 text-foreground" aria-hidden />
                        <span className="text-sm font-medium text-foreground">{label}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button type="button" size="lg" onClick={() => setStep("pay")}>
                Continuar
              </Button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep("select")}
                className="inline-flex items-center gap-1.5 self-start text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" aria-hidden />
                Trocar forma de pagamento ({PAYMENT_METHOD_LABEL[paymentMethod]})
              </button>

              {paymentMethod === "PIX" ? (
                <PixPaymentPanel orderId={order.id} onApproved={handlePixApproved} />
              ) : (
                <form onSubmit={handleCardSubmit} className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {paymentMethod === "DEBIT_CARD" ? (
                      <Landmark className="size-4" aria-hidden />
                    ) : (
                      <CreditCard className="size-4" aria-hidden />
                    )}
                    Dados do cartão {paymentMethod === "DEBIT_CARD" ? "de débito" : "de crédito"}
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

                  {paymentMethod === "CREDIT_CARD" && (
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
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Processando pagamento..."
                    : paymentMethod === "CREDIT_CARD" && installments > 1
                      ? `Pagar ${installments}× de ${formatCurrency(totalPerInstallment)}`
                      : `Pagar ${formatCurrency(order.total)}`}
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="size-3" aria-hidden />
                  Pagamento seguro via e.Rede
                </p>
              </div>
                </form>
              )}
            </>
          )}
        </div>
    </>
  );
}
