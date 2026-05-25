import { FlashList } from "@shopify/flash-list";
import { Redirect } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AuthLoadingView } from "@/components/auth-gate-view";
import { ProductCard } from "@/components/ProductCard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  ExploreProductItem,
  useExploreProducts,
} from "@/hooks/useExploreProducts";
import { useProductCategories } from "@/hooks/useProductCategories";
import { SortOption, useAppStore } from "@/store/useAppStore";

const PRODUCT_COLUMN_COUNT = 2;
const PRODUCT_CARD_ESTIMATED_HEIGHT = 360;
const SEARCH_DEBOUNCE_MS = 350;

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "none", label: "Default" },
  { value: "priceAsc", label: "Price ↑" },
  { value: "priceDesc", label: "Price ↓" },
  { value: "highestRated", label: "Top Rated" },
];

export default function ExploreScreen() {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const hydrationStatus = useAppStore((state) => state.auth.hydrationStatus);

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

  if (hydrationStatus !== "ready") {
    return <AuthLoadingView />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    activeCategory !== null ||
    activeSort !== "none";

  const renderProductItem = ({ item }: { item: ExploreProductItem }) => (
    <View style={styles.productCell}>
      <ProductCard
        imageUrl={item.imageUrl}
        title={item.title}
        brand={item.brand}
        category={item.category}
        price={item.price}
        discountPercentage={item.discountPercentage}
        rating={item.rating}
        stock={item.stock}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>
          Search, filter, and sort product listings
        </Text>
      </View>

      <View style={styles.controlsContainer}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.searchInput}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalRowContent}
        >
          <Pressable
            style={[styles.chip, activeCategory === null && styles.chipActive]}
            onPress={() => setCategory(null)}
          >
            <Text
              style={[
                styles.chipText,
                activeCategory === null && styles.chipTextActive,
              ]}
            >
              All Categories
            </Text>
          </Pressable>

          {categoriesQuery.categories.map((category) => {
            const isActive = activeCategory === category.key;
            return (
              <Pressable
                key={category.key}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setCategory(category.key)}
              >
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}
                  numberOfLines={1}
                >
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalRowContent}
        >
          {SORT_OPTIONS.map((option) => {
            const isActive = activeSort === option.value;
            return (
              <Pressable
                key={option.value}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setSort(option.value)}
              >
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {hasActiveFilters ? (
          <Pressable style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear filters</Text>
          </Pressable>
        ) : null}
      </View>

      {categoriesQuery.isError ? (
        <View style={styles.bannerError}>
          <Text style={styles.bannerErrorText}>
            {categoriesQuery.errorMessage ?? "Unable to load categories."}
          </Text>
          <Pressable onPress={() => void categoriesQuery.retry()}>
            <Text style={styles.bannerErrorAction}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {productsQuery.isInitialLoading ? (
        <View style={styles.centeredStateContainer}>
          <ActivityIndicator size="large" color="#1d4ed8" />
          <Text style={styles.centeredStateTitle}>Loading products...</Text>
        </View>
      ) : productsQuery.errorMessage ? (
        <View style={styles.centeredStateContainer}>
          <Text style={styles.centeredStateTitle}>Unable to load feed</Text>
          <Text style={styles.centeredStateSubtitle}>
            {productsQuery.errorMessage}
          </Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => void productsQuery.retry()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : productsQuery.isEmpty ? (
        <View style={styles.centeredStateContainer}>
          <Text style={styles.centeredStateTitle}>No products found</Text>
          <Text style={styles.centeredStateSubtitle}>
            Adjust your query, category, or sorting preferences.
          </Text>
        </View>
      ) : (
        <FlashList
          data={productsQuery.products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProductItem}
          numColumns={PRODUCT_COLUMN_COUNT}
          drawDistance={PRODUCT_CARD_ESTIMATED_HEIGHT * 3}
          onEndReachedThreshold={0.35}
          onEndReached={productsQuery.loadMore}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl
              refreshing={productsQuery.isRefreshing}
              onRefresh={() => void productsQuery.refresh()}
              tintColor="#1d4ed8"
              colors={["#1d4ed8"]}
            />
          }
          ListFooterComponent={
            productsQuery.isLoadingMore ? (
              <View style={styles.footerLoaderContainer}>
                <ActivityIndicator size="small" color="#1d4ed8" />
                <Text style={styles.footerText}>Loading more...</Text>
              </View>
            ) : !productsQuery.hasNextPage ? (
              <View style={styles.footerLoaderContainer}>
                <Text style={styles.footerText}>
                  You have reached the end of the results.
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#475569",
  },
  controlsContainer: {
    paddingHorizontal: 12,
    gap: 8,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
  },
  horizontalRowContent: {
    gap: 8,
    paddingHorizontal: 2,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  chipActive: {
    borderColor: "#1d4ed8",
    backgroundColor: "#dbeafe",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    textTransform: "capitalize",
  },
  chipTextActive: {
    color: "#1e3a8a",
  },
  clearButton: {
    alignSelf: "flex-start",
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "700",
  },
  bannerError: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  bannerErrorText: {
    flex: 1,
    fontSize: 12,
    color: "#7f1d1d",
    fontWeight: "600",
  },
  bannerErrorAction: {
    color: "#991b1b",
    fontSize: 12,
    fontWeight: "700",
  },
  listContentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  productCell: {
    flex: 1,
    marginHorizontal: 6,
    marginVertical: 8,
  },
  footerLoaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  footerText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    textAlign: "center",
  },
  centeredStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
    backgroundColor: "#f8fafc",
  },
  centeredStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  centeredStateSubtitle: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 4,
    backgroundColor: "#1d4ed8",
    borderRadius: 10,
    minHeight: 40,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
