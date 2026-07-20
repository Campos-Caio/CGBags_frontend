"use client";

import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/context/AuthContext";
import * as cartService from "@/services/cart.service";
import type { Cart } from "@/types/cart";

interface CartContextValue {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  needsCustomerProfile: boolean;
  addItem: (variantId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  refetch: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [needsCustomerProfile, setNeedsCustomerProfile] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const refetch = useCallback(() => setRefreshToken((count) => count + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function syncCart() {
      await Promise.resolve();

      if (!isAuthenticated) {
        if (cancelled) return;
        setCart(null);
        setNeedsCustomerProfile(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await cartService.getCart();
        if (cancelled) return;
        setCart(data);
        setNeedsCustomerProfile(false);
      } catch (error) {
        if (cancelled) return;
        setCart(null);
        setNeedsCustomerProfile(axios.isAxiosError(error) && error.response?.status === 404);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    syncCart();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refreshToken]);

  const addItem = useCallback(async (variantId: number, quantity: number = 1) => {
    const updated = await cartService.addCartItem(variantId, quantity);
    setCart(updated);
    setNeedsCustomerProfile(false);
  }, []);

  const updateItem = useCallback(async (itemId: number, quantity: number) => {
    const updated = await cartService.updateCartItem(itemId, quantity);
    setCart(updated);
  }, []);

  const removeItem = useCallback(async (itemId: number) => {
    await cartService.removeCartItem(itemId);
    setRefreshToken((count) => count + 1);
  }, []);

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isLoading,
        needsCustomerProfile,
        addItem,
        updateItem,
        removeItem,
        refetch,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}
