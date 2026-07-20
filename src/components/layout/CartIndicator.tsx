"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

function CartIndicator() {
  const { itemCount } = useCart();

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      aria-label="Carrinho"
      asChild
      className="relative bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
    >
      <Link href="/cart">
        <ShoppingCart className="size-5" />
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {itemCount}
          </span>
        )}
      </Link>
    </Button>
  );
}

export { CartIndicator };
