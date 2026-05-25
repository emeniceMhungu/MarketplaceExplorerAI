import { FlashList } from "@shopify/flash-list";
import { Redirect, useRouter } from "expo-router";
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
import {
  InfiniteProductItem,
  useInfiniteProducts,
} from "@/hooks/useInfiniteProducts";
import { useAppStore } from "@/store/useAppStore";

const PRODUCT_CARD_ESTIMATED_HEIGHT = 360;
const PRODUCT_COLUMN_COUNT = 2;

export default function HomeScreen() {
  const router = useRouter();
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const hydrationStatus = useAppStore((state) => state.auth.hydrationStatus);
  const addItem = useAppStore((state) => state.addItem);

  const {
    products,
    isInitialLoading,
    isRefreshing,
    isLoadingMore,
    hasNextPage,
    isEmpty,
    errorMessage,
    loadMore,
    refresh,
    retry,
  } = useInfiniteProducts(isAuthenticated && hydrationStatus === "ready");

  if (hydrationStatus !== "ready") {
    return <AuthLoadingView />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (isInitialLoading) {
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

  if (errorMessage) {
    return (
      <SafeAreaView style={styles.centeredStateContainer}>
        <Text style={styles.centeredStateTitle}>Unable to load products</Text>
        <Text style={styles.centeredStateSubtitle}>{errorMessage}</Text>
        <Pressable style={styles.retryButton} onPress={() => void retry()}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (isEmpty) {
    return (
      <SafeAreaView style={styles.centeredStateContainer}>
        <Text style={styles.centeredStateTitle}>No products available</Text>
        <Text style={styles.centeredStateSubtitle}>
          Pull to refresh and try loading the feed again.
        </Text>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: InfiniteProductItem }) => (
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
        }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace Explorer</Text>
        <Text style={styles.headerSubtitle}>
          Discover products from a large catalog
        </Text>
      </View>

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
  retryButton: {
    marginTop: 6,
    backgroundColor: "#1d4ed8",
    borderRadius: 10,
    minHeight: 42,
    minWidth: 140,
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
