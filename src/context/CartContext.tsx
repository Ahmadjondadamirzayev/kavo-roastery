import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  calculateCustomizedUnitPriceCents,
  type CoffeeSize,
  type MilkType,
  type RoastLevel,
  type SugarLevel,
} from '../lib/pricing';
import type { CartItem, Product } from '../types/coffee';

interface AddToCartParams {
  product: Product;
  size: CoffeeSize;
  roastLevel: RoastLevel;
  milkType: MilkType;
  sugarLevel: SugarLevel;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (params: AddToCartParams) => void;
  updateQuantity: (key: string, delta: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  itemCount: number;
  totalCents: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((params: AddToCartParams) => {
    const { product, size, roastLevel, milkType, sugarLevel, quantity } = params;
    const unitPriceCents = calculateCustomizedUnitPriceCents(
      product.basePriceCents,
      product.category,
      size,
      milkType,
    );
    const key = `${product.id}-${size}-${roastLevel}-${milkType}-${sugarLevel}`;

    setItems((prev) => {
      const existing = prev.find((entry) => entry.key === key);
      if (existing) {
        return prev.map((entry) =>
          entry.key === key
            ? { ...entry, quantity: Math.min(50, entry.quantity + quantity) }
            : entry,
        );
      }
      return [
        ...prev,
        {
          key,
          product,
          size,
          roastLevel,
          milkType,
          sugarLevel,
          quantity,
          unitPriceCents,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((key: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((entry) =>
          entry.key === key
            ? { ...entry, quantity: entry.quantity + delta }
            : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((entry) => entry.key !== key));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, entry) => sum + entry.quantity, 0),
    [items],
  );

  const totalCents = useMemo(
    () => items.reduce((sum, entry) => sum + entry.unitPriceCents * entry.quantity, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
        totalCents,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
