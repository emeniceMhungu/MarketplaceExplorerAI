import { FlashList } from "@shopify/flash-list";
import { Redirect, useRouter } from "expo-router";
import { useCallback } from "react";
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
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { OfflineState } from "@/components/states/offline-state";
import { ExploreProductItem } from "@/hooks/useExploreProducts";
import { useExploreScreenState } from "@/hooks/useExploreScreenState";

const PRODUCT_COLUMN_COUNT = 2;
const PRODUCT_CARD_ESTIMATED_HEIGHT = 360;

export default function ExploreScreen() {
  const router = useRouter();
  const {
    showAuthLoadingState,
    shouldRedirectToLogin,
    searchInputValue,
    onSearchInputChange,
    hasActiveFilters,
    onClearFilters,
    categoryOptions,
    sortOptions,
    addProductToCart,
    categoriesQuery,
    productsQuery,
  } = useExploreScreenState();

  const renderProductItem = useCallback(
    ({ item }: { item: ExploreProductItem }) => (
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
          onPress={() => {
            router.push({
              pathname: "/product/[id]",
              params: {
                id: String(item.id),
                from: "explore",
              },
            });
          }}
          onAddToCart={() => {
            addProductToCart(item);
          }}
        />
      </View>
    ),
    [addProductToCart, router],
  );

  if (showAuthLoadingState) {
    return <AuthLoadingView />;
  }

  if (shouldRedirectToLogin) {
    return <Redirect href="/login" />;
  }

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
          value={searchInputValue}
          onChangeText={onSearchInputChange}
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
          {categoryOptions.map((category) => {
            return (
              <Pressable
                key={category.key}
                style={[styles.chip, category.isActive && styles.chipActive]}
                onPress={category.onSelect}
              >
                <Text
                  style={[
                    styles.chipText,
                    category.isActive && styles.chipTextActive,
                  ]}
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
          {sortOptions.map((option) => {
            return (
              <Pressable
                key={option.key}
                style={[styles.chip, option.isActive && styles.chipActive]}
                onPress={option.onSelect}
              >
                <Text
                  style={[
                    styles.chipText,
                    option.isActive && styles.chipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {hasActiveFilters ? (
          <Pressable style={styles.clearButton} onPress={onClearFilters}>
            <Text style={styles.clearButtonText}>Clear filters</Text>
          </Pressable>
        ) : null}
      </View>

      {categoriesQuery.showErrorState ? (
        <View style={styles.bannerError}>
          <Text style={styles.bannerErrorText}>
            {categoriesQuery.errorMessage ?? "Unable to load categories."}
          </Text>
          <Pressable onPress={() => void categoriesQuery.retry()}>
            <Text style={styles.bannerErrorAction}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {productsQuery.showRefreshErrorBanner ? (
        <View
          style={[
            styles.bannerError,
            productsQuery.errorKind === "offline"
              ? styles.feedStatusBannerOffline
              : styles.feedStatusBannerError,
          ]}
        >
          <Text style={styles.bannerErrorText}>
            {productsQuery.refreshErrorMessage ??
              "Unable to refresh results. Showing cached products."}
          </Text>
          <Pressable onPress={() => void productsQuery.retry()}>
            <Text style={styles.bannerErrorAction}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {productsQuery.showLoadingState ? (
        <View style={styles.centeredStateContainer}>
          <ActivityIndicator size="large" color="#1d4ed8" />
          <Text style={styles.centeredStateTitle}>Loading products...</Text>
        </View>
      ) : productsQuery.showErrorState ? (
        productsQuery.errorKind === "offline" ? (
          <OfflineState
            title="You are offline"
            message={
              productsQuery.errorMessage ??
              "Reconnect and retry your search results."
            }
            onRetry={() => {
              void productsQuery.retry();
            }}
          />
        ) : (
          <ErrorState
            title="Unable to load feed"
            message={productsQuery.errorMessage ?? "Unexpected network error"}
            onRetry={() => {
              void productsQuery.retry();
            }}
          />
        )
      ) : productsQuery.showEmptyState ? (
        <EmptyState
          title={productsQuery.emptyStateTitle}
          message={productsQuery.emptyStateMessage}
        />
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
  feedStatusBannerOffline: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
  },
  feedStatusBannerError: {
    backgroundColor: "#fef3c7",
    borderColor: "#fde68a",
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
});
