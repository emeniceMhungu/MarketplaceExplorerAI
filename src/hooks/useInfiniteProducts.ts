import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

const PRODUCTS_PAGE_SIZE = 20;
const PRODUCTS_ENDPOINT = "https://dummyjson.com/products";

type DummyJsonProduct = {
  id: number;
  title: string;
  brand?: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  thumbnail?: string;
  images?: string[];
};

type DummyJsonProductsResponse = {
  products: DummyJsonProduct[];
  total: number;
  skip: number;
  limit: number;
};

type ProductsPage = {
  items: InfiniteProductItem[];
  total: number;
  skip: number;
  limit: number;
  nextSkip: number | undefined;
};

export type InfiniteProductItem = {
  id: number;
  title: string;
  brand: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  imageUrl: string;
};

export type UseInfiniteProductsResult = {
  products: InfiniteProductItem[];
  showLoadingState: boolean;
  showErrorState: boolean;
  showEmptyState: boolean;
  showRefreshErrorBanner: boolean;
  refreshErrorMessage: string | null;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  isEmpty: boolean;
  isError: boolean;
  errorKind: "offline" | "timeout" | "server" | "unknown" | null;
  errorMessage: string | null;
  loadMore: () => void;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
};

function classifyProductsError(error: unknown): {
  kind: "offline" | "timeout" | "server" | "unknown";
  message: string;
} {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("network request failed") ||
      message.includes("failed to fetch") ||
      message.includes("network")
    ) {
      return {
        kind: "offline",
        message:
          "No internet connection detected. Reconnect and try loading products again.",
      };
    }

    if (message.includes("timeout") || message.includes("timed out")) {
      return {
        kind: "timeout",
        message: "The request timed out. Please retry.",
      };
    }

    if (message.includes("unable to load products (")) {
      return {
        kind: "server",
        message: error.message,
      };
    }

    return {
      kind: "unknown",
      message: error.message,
    };
  }

  return {
    kind: "unknown",
    message: "Unexpected network error",
  };
}

function normalizeProduct(product: DummyJsonProduct): InfiniteProductItem {
  const primaryImage =
    product.thumbnail ??
    (Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : "https://dummyjson.com/image/400x300/edf2f7/475569?text=Product");

  return {
    id: product.id,
    title: product.title,
    brand: product.brand?.trim() ? product.brand : "Independent Brand",
    category: product.category,
    price: product.price,
    discountPercentage: product.discountPercentage,
    rating: product.rating,
    stock: product.stock,
    imageUrl: primaryImage,
  };
}

async function fetchProductsPage(
  skip: number,
  signal?: AbortSignal,
): Promise<ProductsPage> {
  const url = `${PRODUCTS_ENDPOINT}?limit=${PRODUCTS_PAGE_SIZE}&skip=${skip}`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Unable to load products (${response.status})`);
  }

  const payload = (await response.json()) as DummyJsonProductsResponse;
  const normalizedItems = payload.products.map(normalizeProduct);
  const nextSkip =
    payload.skip + payload.limit < payload.total
      ? payload.skip + payload.limit
      : undefined;

  return {
    items: normalizedItems,
    total: payload.total,
    skip: payload.skip,
    limit: payload.limit,
    nextSkip,
  };
}

export function useInfiniteProducts(enabled = true): UseInfiniteProductsResult {
  const query = useInfiniteQuery({
    queryKey: ["products", "infinite-feed", PRODUCTS_PAGE_SIZE],
    initialPageParam: 0,
    enabled,
    queryFn: ({ pageParam, signal }) => fetchProductsPage(pageParam, signal),
    getNextPageParam: (lastPage) => lastPage.nextSkip,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const products = useMemo(() => {
    const uniqueProducts = new Map<number, InfiniteProductItem>();

    if (!query.data) {
      return [];
    }

    for (const page of query.data.pages) {
      for (const item of page.items) {
        if (!uniqueProducts.has(item.id)) {
          uniqueProducts.set(item.id, item);
        }
      }
    }

    return Array.from(uniqueProducts.values());
  }, [query.data]);

  const loadMore = useCallback(() => {
    if (!enabled) {
      return;
    }

    if (!query.hasNextPage) {
      return;
    }

    if (query.isFetchingNextPage) {
      return;
    }

    void query.fetchNextPage();
  }, [enabled, query]);

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }

    await query.refetch();
  }, [enabled, query]);

  const retry = useCallback(async () => {
    if (!enabled) {
      return;
    }

    await query.refetch();
  }, [enabled, query]);

  const resolvedError = query.error ? classifyProductsError(query.error) : null;
  const isInitialLoading = query.isPending && products.length === 0;
  const isRefreshing = query.isRefetching && !query.isFetchingNextPage;
  const isLoadingMore = query.isFetchingNextPage;
  const hasNextPage = Boolean(query.hasNextPage);
  const isError = Boolean(query.error);
  const isEmpty = !query.isPending && products.length === 0 && !query.error;

  return {
    products,
    showLoadingState: isInitialLoading,
    showErrorState: isError && !products.length,
    showEmptyState: isEmpty && !isError,
    showRefreshErrorBanner: isError && isRefreshing,
    refreshErrorMessage:
      isError && isRefreshing
        ? (resolvedError?.message ??
          "Unable to refresh feed. Showing cached products.")
        : null,
    isInitialLoading,
    isRefreshing,
    isLoadingMore,
    hasNextPage,
    isEmpty,
    isError,
    errorKind: resolvedError?.kind ?? null,
    errorMessage: resolvedError?.message ?? null,
    loadMore,
    refresh,
    retry,
  };
}
