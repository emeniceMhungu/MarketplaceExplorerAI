import { useMemo } from "react";

import {
  BULK_DISCOUNT_THRESHOLD,
  evaluateCartMetrics,
} from "@/domain/rulesEngine";
import { CartItem, useAppStore } from "@/store/useAppStore";

export type UseCartScreenStateResult = {
  isAuthenticated: boolean;
  showLoadingState: boolean;
  shouldRedirectToLogin: boolean;
  showEmptyState: boolean;
  cartItems: CartItem[];
  itemCount: number;
  uniqueItemCount: number;
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
  hasBulkDiscount: boolean;
  thresholdGap: number;
  incrementItemQuantity: (productId: string | number) => void;
  decrementItemQuantity: (productId: string | number) => void;
  removeItem: (productId: string | number) => void;
  clearCart: () => void;
};

export function useCartScreenState(): UseCartScreenStateResult {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const hydrationStatus = useAppStore((state) => state.auth.hydrationStatus);
  const cartItemsById = useAppStore((state) => state.cart.items);
  const incrementItemQuantity = useAppStore(
    (state) => state.incrementItemQuantity,
  );
  const decrementItemQuantity = useAppStore(
    (state) => state.decrementItemQuantity,
  );
  const removeItem = useAppStore((state) => state.removeItem);
  const clearCart = useAppStore((state) => state.clearCart);

  const cartItems = useMemo(
    () => Object.values(cartItemsById),
    [cartItemsById],
  );

  const metrics = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => {
      const price = Number.isFinite(item.price) ? item.price : 0;
      const quantity = Number.isFinite(item.quantity) ? item.quantity : 0;
      return acc + price * quantity;
    }, 0);

    const itemCount = cartItems.reduce((acc, item) => {
      const quantity = Number.isFinite(item.quantity) ? item.quantity : 0;
      return acc + quantity;
    }, 0);

    const pricing = evaluateCartMetrics(subtotal);

    return {
      subtotal,
      itemCount,
      uniqueItemCount: cartItems.length,
      discountAmount: pricing.discountAmount,
      finalTotal: pricing.finalTotal,
    };
  }, [cartItems]);

  const thresholdGap = Math.max(0, BULK_DISCOUNT_THRESHOLD - metrics.subtotal);
  const hasBulkDiscount = metrics.discountAmount > 0;

  return {
    isAuthenticated,
    showLoadingState: hydrationStatus !== "ready",
    shouldRedirectToLogin: hydrationStatus === "ready" && !isAuthenticated,
    showEmptyState: cartItems.length === 0,
    cartItems,
    itemCount: metrics.itemCount,
    uniqueItemCount: metrics.uniqueItemCount,
    subtotal: metrics.subtotal,
    discountAmount: metrics.discountAmount,
    finalTotal: metrics.finalTotal,
    hasBulkDiscount,
    thresholdGap,
    incrementItemQuantity,
    decrementItemQuantity,
    removeItem,
    clearCart,
  };
}
