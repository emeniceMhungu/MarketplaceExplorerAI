import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const PRODUCTS_ENDPOINT = "https://dummyjson.com/products";

type DummyJsonCategoryProduct = {
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

type DummyJsonCategoryResponse = {
  products: DummyJsonCategoryProduct[];
  total: number;
  skip: number;
  limit: number;
};

export type RelatedProduct = {
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

export type UseRelatedProductsParams = {
  category: string | null;
  currentProductId: number | null;
  limit?: number;
  enabled?: boolean;
};

export type UseRelatedProductsResult = {
  products: RelatedProduct[];
  showLoadingState: boolean;
  showErrorState: boolean;
  showEmptyState: boolean;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  errorMessage: string | null;
  retry: () => Promise<void>;
};

function normalizeProduct(product: DummyJsonCategoryProduct): RelatedProduct {
  const imageUrl =
    product.thumbnail ??
    (Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : "https://dummyjson.com/image/400x300/edf2f7/475569?text=Product");

  return {
    id: product.id,
    title: product.title,
    brand: product.brand?.trim() || "Independent Brand",
    category: product.category,
    price: product.price,
    discountPercentage: product.discountPercentage,
    rating: product.rating,
    stock: product.stock,
    imageUrl,
  };
}

async function fetchRelatedProducts(args: {
  category: string;
  currentProductId: number;
  limit: number;
  signal?: AbortSignal;
}): Promise<RelatedProduct[]> {
  const { category, currentProductId, limit, signal } = args;
  const response = await fetch(
    `${PRODUCTS_ENDPOINT}/category/${encodeURIComponent(category)}?limit=${Math.max(limit * 4, 20)}&skip=0`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(`Unable to load related products (${response.status})`);
  }

  const payload = (await response.json()) as DummyJsonCategoryResponse;

  const filtered = payload.products
    .filter((product) => product.id !== currentProductId)
    .slice(0, limit)
    .map(normalizeProduct);

  return filtered;
}

export function useRelatedProducts({
  category,
  currentProductId,
  limit = 8,
  enabled = true,
}: UseRelatedProductsParams): UseRelatedProductsResult {
  const normalizedCategory = category?.trim() || null;
  const normalizedLimit = Math.max(1, Math.floor(limit));

  const query = useQuery({
    queryKey: [
      "products",
      "related",
      normalizedCategory,
      currentProductId,
      normalizedLimit,
    ],
    enabled:
      enabled &&
      typeof currentProductId === "number" &&
      currentProductId > 0 &&
      typeof normalizedCategory === "string" &&
      normalizedCategory.length > 0,
    queryFn: ({ signal }) =>
      fetchRelatedProducts({
        category: normalizedCategory as string,
        currentProductId: currentProductId as number,
        limit: normalizedLimit,
        signal,
      }),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const products = useMemo(() => query.data ?? [], [query.data]);
  const isLoading = query.isPending;
  const isError = query.isError;
  const isEmpty = !query.isPending && !query.isError && products.length === 0;

  return {
    products,
    showLoadingState: isLoading,
    showErrorState: isError && !products.length,
    showEmptyState: isEmpty && !isError,
    isLoading,
    isError,
    isEmpty,
    errorMessage: query.error instanceof Error ? query.error.message : null,
    retry: async () => {
      await query.refetch();
    },
  };
}
