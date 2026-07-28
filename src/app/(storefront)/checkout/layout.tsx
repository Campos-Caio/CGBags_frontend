"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { Container } from "@/components/ui/container";
import { useAuth } from "@/context/AuthContext";
import { CheckoutProvider } from "@/context/CheckoutContext";
import { getMyProfile } from "@/services/customer.service";

type ProfileGateStatus = "checking" | "ready" | "redirecting";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [profileGate, setProfileGate] = useState<ProfileGateStatus>("checking");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    async function checkProfile() {
      const profile = await getMyProfile();
      if (cancelled) return;

      if (profile === null) {
        setProfileGate("redirecting");
        router.replace("/account/complete-profile");
        return;
      }

      setProfileGate("ready");
    }

    checkProfile();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, router]);

  if (authLoading || !isAuthenticated || profileGate !== "ready") {
    return (
      <Container className="py-16 text-center text-muted-foreground">Carregando...</Container>
    );
  }

  return (
    <CheckoutProvider>
      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <CheckoutSteps />
          {children}
        </div>
      </Container>
    </CheckoutProvider>
  );
}
