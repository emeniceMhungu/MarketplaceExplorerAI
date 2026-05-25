import { FlashList } from "@shopify/flash-list";
import { Redirect, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AuthLoadingView } from "@/components/auth-gate-view";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { OfflineState } from "@/components/states/offline-state";
import { useHomeScreenState } from "@/hooks/useHomeScreenState";
import { InfiniteProductItem } from "@/hooks/useInfiniteProducts";

const PRODUCT_CARD_ESTIMATED_HEIGHT = 360;
const PRODUCT_COLUMN_COUNT = 2;

export default function HomeScreen() {
  const router = useRouter();
  const {
    showAuthLoadingState,
    shouldRedirectToLogin,
    productsQuery,
    addProductToCart,
  } = useHomeScreenState();

  const {
    products,
    showLoadingState,
    showErrorState,
    showEmptyState,
    showRefreshErrorBanner,
    refreshErrorMessage,
    isRefreshing,
    isLoadingMore,
    hasNextPage,
    errorKind,
    errorMessage,
    loadMore,
    refresh,
    retry,
  } = productsQuery;

  if (showAuthLoadingState) {
    return <AuthLoadingView />;
  }

  if (shouldRedirectToLogin) {
    return <Redirect href="/login" />;
  }

  if (showLoadingState) {
    return (
      <SafeAreaView style={styles.centeredStateContainer}>
        <ActivityIndicator size="large" color="#1d4ed8" />
        <Text style={styles.centeredStateTitle}>Loading products...</Text>
        <Text style={styles.centeredStateSubtitle}>
          Building your marketplace feed.
        </Text>
      </SafeAreaView>
    );
  }

  if (showErrorState) {
    if (errorKind === "offline") {
      return (
        <OfflineState
          title="You are offline"
          message={
            errorMessage ??
            "Reconnect to internet and retry loading your marketplace feed."
          }
          onRetry={() => {
            void retry();
          }}
        />
      );
    }

    return (
      <ErrorState
        title="Unable to load products"
        message={errorMessage ?? "Unexpected network error"}
        retryLabel="Try again"
        onRetry={() => {
          void retry();
        }}
      />
    );
  }

  if (showEmptyState) {
    return (
      <EmptyState
        title="No products available"
        message="Pull to refresh and try loading the feed again."
      />
    );
  }

  const renderItem = useCallback(
    ({ item }: { item: InfiniteProductItem }) => (
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
                from: "index",
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace Explorer</Text>
        <Text style={styles.headerSubtitle}>
          Discover products from a large catalog
        </Text>
      </View>

      {showRefreshErrorBanner ? (
        <View
          style={[
            styles.feedStatusBanner,
            errorKind === "offline"
              ? styles.feedStatusBannerOffline
              : styles.feedStatusBannerError,
          ]}
        >
          <Text style={styles.feedStatusBannerText}>
            {refreshErrorMessage ??
              "Unable to refresh feed. Showing cached products."}
          </Text>
          <Pressable onPress={() => void retry()}>
            <Text style={styles.feedStatusBannerAction}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <FlashList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        numColumns={PRODUCT_COLUMN_COUNT}
        contentContainerStyle={styles.listContentContainer}
        drawDistance={PRODUCT_CARD_ESTIMATED_HEIGHT * 3}
        onEndReachedThreshold={0.35}
        onEndReached={loadMore}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor="#1d4ed8"
            colors={["#1d4ed8"]}
          />
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoaderContainer}>
              <ActivityIndicator size="small" color="#1d4ed8" />
              <Text style={styles.footerText}>Loading more products...</Text>
            </View>
          ) : !hasNextPage ? (
            <View style={styles.footerLoaderContainer}>
              <Text style={styles.footerText}>
                You have reached the end of the catalog.
              </Text>
            </View>
          ) : null
        }
      />
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
  feedStatusBanner: {
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  feedStatusBannerOffline: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
  },
  feedStatusBannerError: {
    backgroundColor: "#fef3c7",
    borderColor: "#fde68a",
  },
  feedStatusBannerText: {
    flex: 1,
    fontSize: 12,
    color: "#7c2d12",
    fontWeight: "600",
  },
  feedStatusBannerAction: {
    fontSize: 12,
    color: "#1d4ed8",
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
    fontSize: 24,
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
