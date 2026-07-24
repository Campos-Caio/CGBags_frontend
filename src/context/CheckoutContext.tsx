"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { Address } from "@/types/address";
import type { CouponPreview } from "@/types/coupon";

interface CheckoutContextValue {
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address | null) => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: CouponPreview | null;
  setAppliedCoupon: (coupon: CouponPreview | null) => void;
  selectedFreightId: number | null;
  setSelectedFreightId: (id: number | null) => void;
  reset: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

// Escopado ao layout de /checkout (nao ao providers.tsx global): as
// selecoes de endereco/frete/cupom so' fazem sentido durante o fluxo de
// checkout e devem ser descartadas ao sair dele, entao o provider vive e
// morre junto com o layout dessa rota.
export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponPreview | null>(null);
  const [selectedFreightId, setSelectedFreightId] = useState<number | null>(null);

  function reset() {
    setSelectedAddress(null);
    setCouponCode("");
    setAppliedCoupon(null);
    setSelectedFreightId(null);
  }

  const value = useMemo(
    () => ({
      selectedAddress,
      setSelectedAddress,
      couponCode,
      setCouponCode,
      appliedCoupon,
      setAppliedCoupon,
      selectedFreightId,
      setSelectedFreightId,
      reset,
    }),
    [selectedAddress, couponCode, appliedCoupon, selectedFreightId]
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used within CheckoutProvider");
  return ctx;
}
