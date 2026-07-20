"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getApiErrorMessage } from "@/utils/apiError";

interface AddToCartButtonProps {
  variantId: number;
  disabled?: boolean;
}

function AddToCartButton({ variantId, disabled = false }: AddToCartButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addItem, needsCustomerProfile } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (needsCustomerProfile) {
      router.push("/account/complete-profile");
      return;
    }

    setIsSubmitting(true);
    try {
      await addItem(variantId, 1);
      toast.success("Produto adicionado ao carrinho.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível adicionar o produto ao carrinho."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={disabled || isSubmitting} className="w-full" size="lg">
      {disabled ? "Indisponível" : isSubmitting ? "Adicionando..." : "Adicionar ao carrinho"}
    </Button>
  );
}

export { AddToCartButton };
