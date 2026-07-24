"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DefinitionRow } from "@/components/ui/definition-row";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/context/CheckoutContext";
import { validateCoupon } from "@/services/coupon.service";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCouponValue } from "@/utils/coupon";
import { formatCurrency } from "@/utils/currency";

export default function CheckoutSummaryPage() {
  const router = useRouter();
  const { cart, isLoading: cartLoading } = useCart();
  const { couponCode, setCouponCode, appliedCoupon, setAppliedCoupon } = useCheckout();
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    if (!cartLoading && cart && cart.items.length === 0) {
      router.replace("/cart");
    }
  }, [cart, cartLoading, router]);

  const cartTotal = Number(cart?.total ?? "0");
  const discountAmount = appliedCoupon ? Number(appliedCoupon.discount_amount) : 0;

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

  if (cartLoading || !cart || cart.items.length === 0) {
    return <p className="py-16 text-center text-muted-foreground">Carregando...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
        Resumo do pedido
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Itens do carrinho</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {cart.items.map((item) => (
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
            size="lg"
            label="Total parcial"
            value={formatCurrency(cartTotal - discountAmount)}
          />
        </CardContent>
      </Card>

      <Button size="lg" onClick={() => router.push("/checkout/address")}>
        Continuar para endereço
      </Button>
    </div>
  );
}
