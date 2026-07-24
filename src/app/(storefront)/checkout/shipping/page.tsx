"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DefinitionRow } from "@/components/ui/definition-row";
import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/context/CheckoutContext";
import { checkout } from "@/services/order.service";
import { calculateFreight } from "@/services/shipping.service";
import type { FreightOption } from "@/types/shipping";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency } from "@/utils/currency";

function freightPrice(option: FreightOption): number {
  return Number(option.custom_price ?? option.price);
}

function freightDeliveryLabel(option: FreightOption): string | null {
  if (!option.delivery_range) return null;
  const { min, max } = option.delivery_range;
  if (min === max) {
    return min === 1 ? "1 dia útil" : `${min} dias úteis`;
  }
  return `${min} a ${max} dias úteis`;
}

export default function CheckoutShippingPage() {
  const router = useRouter();
  const { cart, refetch: refetchCart } = useCart();
  const { selectedAddress, appliedCoupon, selectedFreightId, setSelectedFreightId, reset } =
    useCheckout();

  const [freightOptions, setFreightOptions] = useState<FreightOption[]>([]);
  const [freightLoading, setFreightLoading] = useState(true);
  const [freightError, setFreightError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sem endereco no contexto (ex.: refresh da pagina, que descarta o
  // CheckoutProvider), essa etapa nao tem como calcular frete — volta para
  // a etapa anterior. Guard suspensa apos o checkout suceder (ver comentario
  // no handleSubmit), senao entra em corrida com a navegacao pra pagamento.
  const checkoutSucceededRef = useRef(false);

  useEffect(() => {
    if (checkoutSucceededRef.current) return;
    if (!selectedAddress) {
      router.replace("/checkout/address");
    }
  }, [selectedAddress, router]);

  useEffect(() => {
    if (!selectedAddress) return;

    let cancelled = false;

    async function loadFreight() {
      setFreightLoading(true);
      setFreightError(null);
      setSelectedFreightId(null);

      try {
        const options = await calculateFreight(selectedAddress!.zip_code);
        if (cancelled) return;
        setFreightOptions(options);
        if (options.length > 0) setSelectedFreightId(options[0].id);
      } catch (error) {
        if (cancelled) return;
        setFreightOptions([]);
        setFreightError(getApiErrorMessage(error, "Não foi possível calcular o frete."));
      } finally {
        if (!cancelled) setFreightLoading(false);
      }
    }

    loadFreight();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refaz o fetch por zip_code/id, nao pela identidade do objeto Address inteiro
  }, [selectedAddress?.id, selectedAddress?.zip_code]);

  const selectedFreight = freightOptions.find((o) => o.id === selectedFreightId) ?? null;
  const cartTotal = Number(cart?.total ?? "0");
  const discountAmount = appliedCoupon ? Number(appliedCoupon.discount_amount) : 0;
  const grandTotal =
    cartTotal + (selectedFreight ? freightPrice(selectedFreight) : 0) - discountAmount;

  async function handleSubmit() {
    if (!selectedAddress || !selectedFreightId) return;

    setIsSubmitting(true);
    try {
      const order = await checkout(selectedAddress.id, selectedFreightId, appliedCoupon?.code);
      checkoutSucceededRef.current = true;
      refetchCart();
      reset();
      router.push(`/checkout/payment/${order.id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível criar o pedido."));
      setIsSubmitting(false);
    }
  }

  if (!selectedAddress) {
    return <p className="py-16 text-center text-muted-foreground">Redirecionando...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
        Escolha o frete
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Enviar para</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium text-foreground">{selectedAddress.name}</p>
          <p className="text-sm text-muted-foreground">
            {selectedAddress.street}, {selectedAddress.number}
            {selectedAddress.complement ? `, ${selectedAddress.complement}` : ""} —{" "}
            {selectedAddress.district}, {selectedAddress.city}/{selectedAddress.state}
          </p>
          <p className="text-sm text-muted-foreground">CEP {selectedAddress.zip_code}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Forma de envio</CardTitle>
        </CardHeader>
        <CardContent>
          {freightLoading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Calculando opções de frete...
            </p>
          ) : freightError ? (
            <p className="py-4 text-center text-sm text-destructive">{freightError}</p>
          ) : freightOptions.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhuma opção de frete disponível para este endereço.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {freightOptions.map((option) => {
                const deliveryLabel = freightDeliveryLabel(option);
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                      selectedFreightId === option.id
                        ? "border-ring bg-muted/30"
                        : "border-border hover:bg-muted/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="freight"
                      value={option.id}
                      checked={selectedFreightId === option.id}
                      onChange={() => setSelectedFreightId(option.id)}
                      className="mt-0.5 accent-foreground"
                    />
                    <div className="flex flex-1 items-center justify-between gap-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <Truck className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                          <span className="text-sm font-medium text-foreground">
                            {option.company.name} — {option.name}
                          </span>
                        </div>
                        {deliveryLabel && (
                          <p className="text-sm text-muted-foreground">
                            Entrega em {deliveryLabel}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 font-medium text-foreground">
                        {formatCurrency(freightPrice(option))}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          <DefinitionRow label="Subtotal" value={formatCurrency(cartTotal)} />
          {appliedCoupon && (
            <DefinitionRow label="Desconto" value={`- ${formatCurrency(discountAmount)}`} />
          )}
          <DefinitionRow
            label="Frete"
            value={selectedFreight ? formatCurrency(freightPrice(selectedFreight)) : "—"}
          />
          <DefinitionRow size="lg" label="Total" value={formatCurrency(grandTotal)} />
        </CardContent>
      </Card>

      <Button
        size="lg"
        disabled={isSubmitting || !selectedFreightId}
        onClick={handleSubmit}
      >
        {isSubmitting ? "Criando pedido..." : "Finalizar pedido"}
      </Button>
    </div>
  );
}
