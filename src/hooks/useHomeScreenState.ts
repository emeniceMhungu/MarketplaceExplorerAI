import { useCallback } from "react";

import {
  InfiniteProductItem,
  useInfiniteProducts,
} from "@/hooks/useInfiniteProducts";
import { useAppStore } from "@/store/useAppStore";

export type UseHomeScreenStateResult = {
  showAuthLoadingState: boolean;
  shouldRedirectToLogin: boolean;
  productsQuery: ReturnType<typeof useInfiniteProducts>;
  addProductToCart: (item: InfiniteProductItem) => void;
};

export function useHomeScreenState(): UseHomeScreenStateResult {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const hydrationStatus = useAppStore((state) => state.auth.hydrationStatus);
  const addItem = useAppStore((state) => state.addItem);

  const productsQuery = useInfiniteProducts(
    isAuthenticated && hydrationStatus === "ready",
  );

  const addProductToCart = useCallback(
    (item: InfiniteProductItem) => {
      addItem({
        productId: item.id,
        title: item.title,
        brand: item.brand,
        category: item.category,
        imageUrl: item.imageUrl,
        price: item.price,
        rating: item.rating,
        stock: item.stock,
      });
    },
    [addItem],
  );

  return {
    showAuthLoadingState: hydrationStatus !== "ready",
    shouldRedirectToLogin: hydrationStatus === "ready" && !isAuthenticated,
    productsQuery,
    addProductToCart,
  };
}
