"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

const STEPS = [
  { path: "/checkout", label: "Resumo" },
  { path: "/checkout/address", label: "Endereço" },
  { path: "/checkout/shipping", label: "Frete" },
  { path: "/checkout/payment", label: "Pagamento" },
] as const;

export function CheckoutSteps() {
  const pathname = usePathname();

  const activeIndex = pathname.startsWith("/checkout/payment")
    ? 3
    : pathname === "/checkout/shipping"
      ? 2
      : pathname === "/checkout/address"
        ? 1
        : 0;

  return (
    <ol className="mb-8 flex items-center">
      {STEPS.map((step, index) => {
        const isDone = index < activeIndex;
        const isActive = index === activeIndex;
        // So' faz sentido voltar pelo indicador antes do pedido existir —
        // a etapa de pagamento ja' commitou um Order no backend, entao
        // "voltar" para endereco/frete pelo indicador nao desfaria nada.
        const isClickable = isDone && activeIndex < 3;

        const content = (
          <>
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                isActive
                  ? "bg-foreground text-background"
                  : isDone
                    ? "bg-foreground/80 text-background"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {isDone ? <Check className="size-3.5" aria-hidden /> : index + 1}
            </span>
            <span
              className={`text-sm ${
                isActive ? "font-medium text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </>
        );

        return (
          <li key={step.path} className="flex flex-1 items-center gap-2 last:flex-none">
            {isClickable ? (
              <Link href={step.path} className="flex shrink-0 items-center gap-2">
                {content}
              </Link>
            ) : (
              <div className="flex shrink-0 items-center gap-2">{content}</div>
            )}
            {index < STEPS.length - 1 && <span className="h-px flex-1 bg-border" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
