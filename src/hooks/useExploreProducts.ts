import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { SortOption } from "@/store/useAppStore";

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

type ExplorePage = {
  items: ExploreProductItem[];
  total: number;
  skip: number;
  limit: number;
  nextSkip: number | undefined;
};

export type ExploreProductItem = {
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

export type UseExploreProductsParams = {
  enabled?: boolean;
  searchQuery: string;
  activeCategory: string | null;
  sort: SortOption;
};

export type UseExploreProductsResult = {
  products: ExploreProductItem[];
  showLoadingState: boolean;
  showErrorState: boolean;
  showEmptyState: boolean;
  showRefreshErrorBanner: boolean;
  refreshErrorMessage: string | null;
  emptyStateTitle: string;
  emptyStateMessage: string;
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

function classifyExploreError(error: unknown): {
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
          "No internet connection detected. Reconnect and retry your search.",
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

function normalizeProduct(product: DummyJsonProduct): ExploreProductItem {
  const imageUrl =
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
    imageUrl,
  };
}

function resolveEndpoint(args: {
  searchQuery: string;
  activeCategory: string | null;
  skip: number;
}): string {
  const { searchQuery, activeCategory, skip } = args;

  if (activeCategory) {
    return `${PRODUCTS_ENDPOINT}/category/${encodeURIComponent(activeCategory)}?limit=${PRODUCTS_PAGE_SIZE}&skip=${skip}`;
  }

  if (searchQuery) {
    return `${PRODUCTS_ENDPOINT}/search?q=${encodeURIComponent(searchQuery)}&limit=${PRODUCTS_PAGE_SIZE}&skip=${skip}`;
  }

  return `${PRODUCTS_ENDPOINT}?limit=${PRODUCTS_PAGE_SIZE}&skip=${skip}`;
}

async function fetchExplorePage(args: {
  skip: number;
  searchQuery: string;
  activeCategory: string | null;
  signal?: AbortSignal;
}): Promise<ExplorePage> {
  const { skip, searchQuery, activeCategory, signal } = args;
  const endpoint = resolveEndpoint({ searchQuery, activeCategory, skip });

  const response = await fetch(endpoint, { signal });

  if (!response.ok) {
    throw new Error(`Unable to load products (${response.status})`);
  }

  const payload = (await response.json()) as DummyJsonProductsResponse;
  const items = payload.products.map(normalizeProduct);
  const nextSkip =
    payload.skip + payload.limit < payload.total
      ? payload.skip + payload.limit
      : undefined;

  return {
    items,
    total: payload.total,
    skip: payload.skip,
    limit: payload.limit,
    nextSkip,
  };
}

function applyLocalCategorySearchFilter(
  pages: ExplorePage[],
  searchQuery: string,
  activeCategory: string | null,
): ExplorePage[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!activeCategory || !normalizedQuery) {
    return pages;
  }

  return pages.map((page) => ({
    ...page,
    items: page.items.filter((item) => {
      const title = item.title.toLowerCase();
      const brand = item.brand.toLowerCase();
      const category = item.category.toLowerCase();
      return (
        title.includes(normalizedQuery) ||
        brand.includes(normalizedQuery) ||
        category.includes(normalizedQuery)
      );
    }),
  }));
}

function flattenDedupSort(
  pages: ExplorePage[],
  sort: SortOption,
): ExploreProductItem[] {
  const uniqueById = new Map<number, ExploreProductItem>();

  for (const page of pages) {
    for (const item of page.items) {
      if (!uniqueById.has(item.id)) {
        uniqueById.set(item.id, item);
      }
    }
  }

  const products = Array.from(uniqueById.values());

  switch (sort) {
    case "priceAsc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "priceDesc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "highestRated":
      products.sort((a, b) => b.rating - a.rating);
      break;
    case "none":
    default:
      break;
  }

  return products;
}

export function useExploreProducts({
  enabled = true,
  searchQuery,
  activeCategory,
  sort,
}: UseExploreProductsParams): UseExploreProductsResult {
  const normalizedSearch = searchQuery.trim();

  const query = useInfiniteQuery<
    ExplorePage,
    Error,
    InfiniteData<ExplorePage>,
    [string, string, string | null, string, number],
    number
  >({
    queryKey: [
      "products",
      "explore",
      activeCategory,
      normalizedSearch,
      PRODUCTS_PAGE_SIZE,
    ],
    enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      fetchExplorePage({
        skip: pageParam,
        searchQuery: normalizedSearch,
        activeCategory,
        signal,
      }),
    getNextPageParam: (lastPage) => lastPage.nextSkip,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    select: (data) => {
      const locallyFilteredPages = applyLocalCategorySearchFilter(
        data.pages,
        normalizedSearch,
        activeCategory,
      );

      return {
        pages: locallyFilteredPages,
        pageParams: data.pageParams,
      };
    },
  });

  const products = useMemo(
    () => flattenDedupSort(query.data?.pages ?? [], sort),
    [query.data?.pages, sort],
  );

  const loadMore = useCallback(() => {
    if (!enabled) {
      return;
    }
    if (!query.hasNextPage || query.isFetchingNextPage) {
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

  const resolvedError = query.error ? classifyExploreError(query.error) : null;
  const hasSearchQuery = normalizedSearch.length > 0;
  const isInitialLoading = query.isPending && products.length === 0;
  const isRefreshing = query.isRefetching && !query.isFetchingNextPage;
  const isLoadingMore = query.isFetchingNextPage;
  const hasNextPage = Boolean(query.hasNextPage);
  const isError = Boolean(query.error);
  const isEmpty = !query.isPending && products.length === 0 && !query.isError;

  return {
    products,
    showLoadingState: isInitialLoading,
    showErrorState: isError && !products.length,
    showEmptyState: isEmpty && !isError,
    showRefreshErrorBanner: isError && isRefreshing,
    refreshErrorMessage:
      isError && isRefreshing
        ? (resolvedError?.message ??
          "Unable to refresh results. Showing cached products.")
        : null,
    emptyStateTitle: hasSearchQuery
      ? "No matching products"
      : "No products found",
    emptyStateMessage: hasSearchQuery
      ? "Try a different keyword, category, or sort option."
      : "Adjust your category or sorting preferences.",
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
