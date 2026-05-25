import { useCallback, useMemo } from "react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  ExploreProductItem,
  useExploreProducts,
} from "@/hooks/useExploreProducts";
import { useProductCategories } from "@/hooks/useProductCategories";
import { SortOption, useAppStore } from "@/store/useAppStore";

const SEARCH_DEBOUNCE_MS = 350;

export type ExploreSortOptionConfig = { value: SortOption; label: string };
export type ExploreSelectionOption = {
  key: string;
  label: string;
  isActive: boolean;
  onSelect: () => void;
};

export const EXPLORE_SORT_OPTIONS: ExploreSortOptionConfig[] = [
  { value: "none", label: "Default" },
  { value: "priceAsc", label: "Price ↑" },
  { value: "priceDesc", label: "Price ↓" },
  { value: "highestRated", label: "Top Rated" },
];

export type UseExploreScreenStateResult = {
  showAuthLoadingState: boolean;
  shouldRedirectToLogin: boolean;
  searchInputValue: string;
  onSearchInputChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  categoryOptions: ExploreSelectionOption[];
  sortOptions: ExploreSelectionOption[];
  addProductToCart: (item: ExploreProductItem) => void;
  categoriesQuery: ReturnType<typeof useProductCategories>;
  productsQuery: ReturnType<typeof useExploreProducts>;
};

export function useExploreScreenState(): UseExploreScreenStateResult {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const hydrationStatus = useAppStore((state) => state.auth.hydrationStatus);
  const addItem = useAppStore((state) => state.addItem);

  const searchQuery = useAppStore((state) => state.filter.searchQuery);
  const activeCategory = useAppStore((state) => state.filter.category);
  const activeSort = useAppStore((state) => state.filter.sort);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const setCategory = useAppStore((state) => state.setCategory);
  const setSort = useAppStore((state) => state.setSort);
  const clearFilters = useAppStore((state) => state.clearFilters);

  const debouncedSearchQuery = useDebouncedValue(
    searchQuery,
    SEARCH_DEBOUNCE_MS,
  );

  const categoriesQuery = useProductCategories(
    isAuthenticated && hydrationStatus === "ready",
  );

  const productsQuery = useExploreProducts({
    enabled: isAuthenticated && hydrationStatus === "ready",
    searchQuery: debouncedSearchQuery,
    activeCategory,
    sort: activeSort,
  });

  const hasActiveFilters = useMemo(
    () =>
      searchQuery.trim().length > 0 ||
      activeCategory !== null ||
      activeSort !== "none",
    [searchQuery, activeCategory, activeSort],
  );

  const onSearchInputChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
    },
    [setSearchQuery],
  );

  const onClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const addProductToCart = useCallback(
    (item: ExploreProductItem) => {
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

  const categoryOptions = useMemo<ExploreSelectionOption[]>(() => {
    const allCategoriesOption: ExploreSelectionOption = {
      key: "all",
      label: "All Categories",
      isActive: activeCategory === null,
      onSelect: () => {
        setCategory(null);
      },
    };

    const mappedCategoryOptions = categoriesQuery.categories.map(
      (category) => ({
        key: category.key,
        label: category.label,
        isActive: activeCategory === category.key,
        onSelect: () => {
          setCategory(category.key);
        },
      }),
    );

    return [allCategoriesOption, ...mappedCategoryOptions];
  }, [activeCategory, categoriesQuery.categories, setCategory]);

  const sortOptions = useMemo<ExploreSelectionOption[]>(
    () =>
      EXPLORE_SORT_OPTIONS.map((option) => ({
        key: option.value,
        label: option.label,
        isActive: activeSort === option.value,
        onSelect: () => {
          setSort(option.value);
        },
      })),
    [activeSort, setSort],
  );

  return {
    showAuthLoadingState: hydrationStatus !== "ready",
    shouldRedirectToLogin: hydrationStatus === "ready" && !isAuthenticated,
    searchInputValue: searchQuery,
    onSearchInputChange,
    hasActiveFilters,
    onClearFilters,
    categoryOptions,
    sortOptions,
    addProductToCart,
    categoriesQuery,
    productsQuery,
  };
}
