"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { DefinitionRow } from "@/components/ui/definition-row";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { listMyAddresses } from "@/services/address.service";
import { validateCoupon } from "@/services/coupon.service";
import { checkout } from "@/services/order.service";
import { calculateFreight } from "@/services/shipping.service";
import type { Address } from "@/types/address";
import type { CouponPreview } from "@/types/coupon";
import type { FreightOption } from "@/types/shipping";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCouponValue } from "@/utils/coupon";
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

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { cart, isLoading: cartLoading, refetch: refetchCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addressesLoading, setAddressesLoading] = useState(true);

  const [freightOptions, setFreightOptions] = useState<FreightOption[]>([]);
  const [selectedFreightId, setSelectedFreightId] = useState<number | null>(null);
  const [freightLoading, setFreightLoading] = useState(false);
  const [freightError, setFreightError] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponPreview | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  // Uma vez que o checkout e concluido com sucesso, o carrinho e limpo no
  // backend e o proximo refetch traz items=[] — sem essa flag, o guard de
  // "carrinho vazio" abaixo entra em corrida com a navegacao para a pagina
  // de pagamento e pode redirecionar de volta para /cart antes que o usuario
  // chegue a pagar, deixando o pedido preso em PENDING_PAYMENT.
  const checkoutSucceededRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    listMyAddresses()
      .then((data) => {
        setAddresses(data);
        const defaultAddr = data.find((a) => a.is_default) ?? data[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Não foi possível carregar seus endereços."));
      })
      .finally(() => setAddressesLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (checkoutSucceededRef.current) return;
    if (!cartLoading && cart && cart.items.length === 0) {
      router.replace("/cart");
    }
  }, [cart, cartLoading, router]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;

  useEffect(() => {
    if (!selectedAddress) return;

    let cancelled = false;

    async function loadFreight() {
      await Promise.resolve();
      if (cancelled) return;

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

  // Sem endereco valido selecionado, as opcoes/selecao de frete carregadas antes
  // (de um endereco anterior) ficam obsoletas — derivado aqui em vez de limpo via
  // effect, pra nao disparar setState sincrono sem nenhum trabalho assincrono.
  const activeFreightOptions = selectedAddress ? freightOptions : [];
  const activeSelectedFreightId = selectedAddress ? selectedFreightId : null;
  const selectedFreight = activeFreightOptions.find((o) => o.id === activeSelectedFreightId) ?? null;
  const cartTotal = Number(cart?.total ?? "0");
  const discountAmount = appliedCoupon ? Number(appliedCoupon.discount_amount) : 0;
  const grandTotal =
    cartTotal + (selectedFreight ? freightPrice(selectedFreight) : 0) - discountAmount;

  async function handleApplyCoupon() {
    const code = couponCode.trim();
    if (!code) return;

    setIsApplyingCoupon(true);
    try {
      const preview = await validateCoupon(code);
      setAppliedCoupon(preview);
      toast.success("Cupom aplicado.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível aplicar este cupom."));
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selectedAddressId || !selectedFreightId) return;

    setIsSubmitting(true);
    try {
      const order = await checkout(selectedAddressId, selectedFreightId, appliedCoupon?.code);
      checkoutSucceededRef.current = true;
      refetchCart();
      router.push(`/checkout/payment/${order.id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível criar o pedido."));
      setIsSubmitting(false);
    }
  }

  if (authLoading || cartLoading || addressesLoading || !isAuthenticated) {
    return (
      <Container className="py-16 text-center text-muted-foreground">Carregando...</Container>
    );
  }

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          Finalizar pedido
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do carrinho</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border">
              {cart?.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <p className="font-medium text-foreground">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}

              <div className="py-3">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Cupom {appliedCoupon.code}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCouponValue(appliedCoupon.discount_type, appliedCoupon.value)} de
                        desconto
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={handleRemoveCoupon}>
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Código do cupom"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      onClick={handleApplyCoupon}
                    >
                      {isApplyingCoupon ? "Aplicando..." : "Aplicar"}
                    </Button>
                  </div>
                )}
              </div>

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

          <Card>
            <CardHeader>
              <CardTitle>Endereço de entrega</CardTitle>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Você ainda não tem endereços cadastrados.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/account">Adicionar endereço</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                        selectedAddressId === address.id
                          ? "border-ring bg-muted/30"
                          : "border-border hover:bg-muted/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="mt-0.5 accent-foreground"
                      />
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                          <span className="text-sm font-medium text-foreground">{address.name}</span>
                          {address.is_default && (
                            <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                              Padrão
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {address.street}, {address.number}
                          {address.complement ? `, ${address.complement}` : ""} —{" "}
                          {address.district}, {address.city}/{address.state}
                        </p>
                        <p className="text-sm text-muted-foreground">CEP {address.zip_code}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {addresses.length > 0 && (
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
                ) : activeFreightOptions.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Nenhuma opção de frete disponível para este endereço.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {activeFreightOptions.map((option) => {
                      const deliveryLabel = freightDeliveryLabel(option);
                      return (
                        <label
                          key={option.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                            activeSelectedFreightId === option.id
                              ? "border-ring bg-muted/30"
                              : "border-border hover:bg-muted/20"
                          }`}
                        >
                          <input
                            type="radio"
                            name="freight"
                            value={option.id}
                            checked={activeSelectedFreightId === option.id}
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
          )}

          <Button
            type="submit"
            size="lg"
            disabled={
              isSubmitting || !selectedAddress || !activeSelectedFreightId || addresses.length === 0
            }
          >
            {isSubmitting ? "Criando pedido..." : "Ir para o pagamento"}
          </Button>
        </form>
      </div>
    </Container>
  );
}
