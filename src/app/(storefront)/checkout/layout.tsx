"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { Container } from "@/components/ui/container";
import { useAuth } from "@/context/AuthContext";
import { CheckoutProvider } from "@/context/CheckoutContext";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
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
