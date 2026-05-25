import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type DummyCategoryEntry =
  | string
  | {
      slug?: string;
      name?: string;
      url?: string;
    };

const CATEGORIES_ENDPOINT = "https://dummyjson.com/products/categories";

export type ProductCategory = {
  key: string;
  label: string;
};

export type UseProductCategoriesResult = {
  categories: ProductCategory[];
  showLoadingState: boolean;
  showErrorState: boolean;
  showEmptyState: boolean;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  errorMessage: string | null;
  retry: () => Promise<void>;
};

function normalizeCategoryEntry(
  entry: DummyCategoryEntry,
): ProductCategory | null {
  if (typeof entry === "string") {
    const key = entry.trim();
    if (!key) {
      return null;
    }
    return {
      key,
      label: key.replace(/-/g, " "),
    };
  }

  const key = entry.slug?.trim() || entry.name?.trim();
  if (!key) {
    return null;
  }

  const label = entry.name?.trim() || key.replace(/-/g, " ");
  return {
    key,
    label,
  };
}

async function fetchProductCategories(
  signal?: AbortSignal,
): Promise<ProductCategory[]> {
  const response = await fetch(CATEGORIES_ENDPOINT, { signal });

  if (!response.ok) {
    throw new Error(`Unable to load categories (${response.status})`);
  }

  const payload = (await response.json()) as DummyCategoryEntry[];
  const categories: ProductCategory[] = [];
  const seen = new Set<string>();

  for (const entry of payload) {
    const normalized = normalizeCategoryEntry(entry);
    if (!normalized) {
      continue;
    }

    if (seen.has(normalized.key)) {
      continue;
    }

    seen.add(normalized.key);
    categories.push(normalized);
  }

  return categories;
}

export function useProductCategories(
  enabled = true,
): UseProductCategoriesResult {
  const query = useQuery({
    queryKey: ["products", "categories"],
    enabled,
    queryFn: ({ signal }) => fetchProductCategories(signal),
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
  });

  const categories = useMemo(() => query.data ?? [], [query.data]);
  const isLoading = query.isPending;
  const isError = query.isError;
  const isEmpty = !query.isPending && !query.isError && categories.length === 0;

  return {
    categories,
    showLoadingState: isLoading,
    showErrorState: isError && !categories.length,
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
