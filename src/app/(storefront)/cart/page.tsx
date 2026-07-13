"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/types/cart";
import { formatCurrency } from "@/utils/currency";
import { getApiErrorMessage } from "@/utils/apiError";

export default function CartPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { cart, isLoading, needsCustomerProfile, updateItem, removeItem } = useCart();

  async function handleRemove(itemId: number) {
    try {
      await removeItem(itemId);
      toast.success("Item removido do carrinho.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível remover este item do carrinho."));
    }
  }

  async function handleQuantityChange(item: CartItem, delta: number) {
    const nextQuantity = item.quantity + delta;

    if (nextQuantity < 1) {
      return handleRemove(item.id);
    }

    try {
      await updateItem(item.id, nextQuantity);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Não foi possível atualizar a quantidade deste item.")
      );
    }
  }

  if (authLoading || isLoading) {
    return <Container className="py-16 text-center text-muted-foreground">Carregando...</Container>;
  }

  if (!isAuthenticated) {
    return (
      <Container className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Seu carrinho</h1>
        <p className="text-muted-foreground">Faça login para ver os itens do seu carrinho.</p>
        <Button asChild>
          <Link href="/login">Entrar</Link>
        </Button>
      </Container>
    );
  }

  if (needsCustomerProfile) {
    return (
      <Container className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Seu carrinho</h1>
        <p className="max-w-prose text-muted-foreground">
          Finalize seu cadastro para começar a usar o carrinho.
        </p>
        <Button asChild>
          <Link href="/account/complete-profile">Completar cadastro</Link>
        </Button>
      </Container>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container className="flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingCart className="size-10 text-muted-foreground" aria-hidden />
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Seu carrinho está vazio
        </h1>
        <Button asChild>
          <Link href="/products">Ver produtos</Link>
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
        Seu carrinho
      </h1>

      <div className="mt-8 divide-y divide-border border-t border-border">
        {cart.items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center gap-4 py-5">
            <div className="min-w-40 flex-1">
              <p className="font-medium text-foreground">{item.product_name}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(item.unit_price)} / un.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Diminuir quantidade"
                onClick={() => handleQuantityChange(item, -1)}
              >
                <Minus />
              </Button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Aumentar quantidade"
                onClick={() => handleQuantityChange(item, 1)}
              >
                <Plus />
              </Button>
            </div>

            <p className="w-24 text-right font-medium text-foreground">
              {formatCurrency(item.subtotal)}
            </p>

            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remover ${item.product_name}`}
              onClick={() => handleRemove(item.id)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        <span className="font-heading text-lg font-semibold text-foreground">Total</span>
        <span className="font-heading text-xl font-semibold text-foreground">
          {formatCurrency(cart.total)}
        </span>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" asChild>
          <Link href="/products">Continuar comprando</Link>
        </Button>
        <Button asChild>
          <Link href="/checkout">Finalizar pedido</Link>
        </Button>
      </div>
    </Container>
  );
}
