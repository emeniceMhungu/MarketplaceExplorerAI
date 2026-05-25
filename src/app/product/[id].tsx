import { Image } from "expo-image";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AuthLoadingView } from "@/components/auth-gate-view";
import { ProductCard } from "@/components/ProductCard";
import { evaluateProductRules } from "@/domain/rulesEngine";
import { useProductDetails } from "@/hooks/useProductDetails";
import { RelatedProduct, useRelatedProducts } from "@/hooks/useRelatedProducts";
import { useAppStore } from "@/store/useAppStore";

const GALLERY_HORIZONTAL_MARGIN = 12;
const GALLERY_ITEM_WIDTH =
  Dimensions.get("window").width - GALLERY_HORIZONTAL_MARGIN * 2;

function resolveProductId(rawId: string | string[] | undefined): number | null {
  const firstValue = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!firstValue) {
    return null;
  }

  const parsed = Number(firstValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.floor(parsed);
}

export default function ProductDetailsScreen() {
  const { id, from } = useLocalSearchParams<{
    id?: string | string[];
    from?: string | string[];
  }>();
  const router = useRouter();

  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const hydrationStatus = useAppStore((state) => state.auth.hydrationStatus);
  const addItem = useAppStore((state) => state.addItem);

  const productId = useMemo(() => resolveProductId(id), [id]);
  const sourceRoute = useMemo(() => {
    const source = Array.isArray(from) ? from[0] : from;
    return source === "explore" ? "/explore" : "/";
  }, [from]);

  const sourceParam = sourceRoute === "/explore" ? "explore" : "index";

  const navigateBackToSource = () => {
    router.replace(sourceRoute);
  };

  const detailsQuery = useProductDetails(
    productId,
    isAuthenticated && hydrationStatus === "ready",
  );

  const relatedQuery = useRelatedProducts({
    category: detailsQuery.product?.category ?? null,
    currentProductId: detailsQuery.product?.id ?? null,
    enabled:
      isAuthenticated && hydrationStatus === "ready" && !!detailsQuery.product,
    limit: 8,
  });

  if (hydrationStatus !== "ready") {
    return <AuthLoadingView />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (productId === null) {
    return (
      <SafeAreaView style={styles.centeredStateContainer}>
        <Text style={styles.stateTitle}>Invalid product link</Text>
        <Text style={styles.stateSubtitle}>
          We could not resolve the selected product.
        </Text>
        <Pressable style={styles.actionButton} onPress={navigateBackToSource}>
          <Text style={styles.actionButtonText}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (detailsQuery.isLoading || !detailsQuery.product) {
    return (
      <SafeAreaView style={styles.centeredStateContainer}>
        <ActivityIndicator size="large" color="#1d4ed8" />
        <Text style={styles.stateTitle}>Loading product details...</Text>
      </SafeAreaView>
    );
  }

  if (detailsQuery.isError) {
    return (
      <SafeAreaView style={styles.centeredStateContainer}>
        <Text style={styles.stateTitle}>Unable to load product details</Text>
        <Text style={styles.stateSubtitle}>
          {detailsQuery.errorMessage ?? "Unexpected network error"}
        </Text>
        <Pressable
          style={styles.actionButton}
          onPress={() => void detailsQuery.retry()}
        >
          <Text style={styles.actionButtonText}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const product = detailsQuery.product;
  const rules = evaluateProductRules({
    price: product.price,
    rating: product.rating,
    stock: product.stock,
  });

  const averageReviewRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
        product.reviews.length
      : product.rating;

  const addToCartDisabled = !rules.canAddToCart;

  const galleryImages =
    product.images.length > 0 ? product.images : [product.imageUrl];

  const gallerySingleImageCentered = useMemo(
    () =>
      galleryImages.length === 1
        ? ({
            flexGrow: 1,
            justifyContent: "center" as const,
            alignItems: "center" as const,
          } as const)
        : undefined,
    [galleryImages.length],
  );

  const renderRelatedItem = ({ item }: { item: RelatedProduct }) => (
    <View style={styles.relatedItemCell}>
      <ProductCard
        imageUrl={item.imageUrl}
        title={item.title}
        brand={item.brand}
        category={item.category}
        price={item.price}
        discountPercentage={item.discountPercentage}
        rating={item.rating}
        stock={item.stock}
        onPress={() =>
          router.push({
            pathname: "/product/[id]",
            params: {
              id: String(item.id),
              from: sourceParam,
            },
          })
        }
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
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={navigateBackToSource}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        <FlatList
          data={galleryImages}
          keyExtractor={(item, index) => `${item}-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            gallerySingleImageCentered
              ? [styles.galleryContainer, gallerySingleImageCentered]
              : styles.galleryContainer
          }
          scrollEventThrottle={16}
          snapToInterval={GALLERY_ITEM_WIDTH + 10}
          snapToAlignment="center"
          decelerationRate="fast"
          renderItem={({ item }) => (
            <Image
              source={item}
              style={[
                styles.galleryImage,
                { width: GALLERY_ITEM_WIDTH, height: 220 },
              ]}
              contentFit="cover"
            />
          )}
        />

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.metaLine}>
            {product.brand} • {product.category}
          </Text>

          <View style={styles.metricsRow}>
            <Text style={styles.metricLabel}>${product.price.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>
              -{product.discountPercentage.toFixed(1)}%
            </Text>
            <Text style={styles.metricLabel}>
              ★ {product.rating.toFixed(1)}
            </Text>
          </View>

          <View style={styles.badgesRow}>
            {rules.premiumChoice ? (
              <View style={[styles.badge, styles.premiumBadge]}>
                <Text style={[styles.badgeText, styles.premiumBadgeText]}>
                  Premium Choice
                </Text>
              </View>
            ) : null}

            {rules.lowStock ? (
              <View style={[styles.badge, styles.lowStockBadge]}>
                <Text style={[styles.badgeText, styles.lowStockBadgeText]}>
                  Low Stock
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.stockText}>
            Availability:{" "}
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </Text>
          <Text style={styles.reviewsSummary}>
            Reviews: {product.reviews.length} • Avg{" "}
            {averageReviewRating.toFixed(1)}
          </Text>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>

          {!rules.canAddToCart && rules.disabledReason ? (
            <Text style={styles.disabledReason}>{rules.disabledReason}</Text>
          ) : null}

          <Pressable
            style={[
              styles.addButton,
              addToCartDisabled && styles.addButtonDisabled,
            ]}
            disabled={addToCartDisabled}
            onPress={() => {
              addItem({
                productId: product.id,
                title: product.title,
                brand: product.brand,
                category: product.category,
                imageUrl: product.imageUrl,
                price: product.price,
                rating: product.rating,
                stock: product.stock,
              });
            }}
          >
            <Text style={styles.addButtonText}>
              {addToCartDisabled ? "Unavailable" : "Add to Cart"}
            </Text>
          </Pressable>

          <View style={styles.relatedSectionHeader}>
            <Text style={styles.sectionTitle}>Related Products</Text>
            {relatedQuery.isLoading ? (
              <ActivityIndicator size="small" color="#1d4ed8" />
            ) : null}
          </View>

          {relatedQuery.isError ? (
            <View style={styles.relatedStateBox}>
              <Text style={styles.relatedStateText}>
                {relatedQuery.errorMessage ??
                  "Unable to load related products."}
              </Text>
              <Pressable onPress={() => void relatedQuery.retry()}>
                <Text style={styles.relatedRetryText}>Retry</Text>
              </Pressable>
            </View>
          ) : relatedQuery.products.length === 0 ? (
            <View style={styles.relatedStateBox}>
              <Text style={styles.relatedStateText}>
                No related products available.
              </Text>
            </View>
          ) : (
            <FlatList
              data={relatedQuery.products}
              horizontal
              keyExtractor={(item) => String(item.id)}
              renderItem={renderRelatedItem}
              contentContainerStyle={styles.relatedListContainer}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContentContainer: {
    paddingBottom: 24,
    paddingTop: 44,
  },
  topBar: {
    position: "absolute",
    top: 60,
    left: 16,
    zIndex: 999,
  },
  backButton: {
    alignSelf: "flex-start",
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  galleryContainer: {
    gap: 10,
    paddingHorizontal: GALLERY_HORIZONTAL_MARGIN,
    paddingVertical: 8,
  },
  galleryImage: {
    borderRadius: 14,
    backgroundColor: "#e2e8f0",
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  metaLine: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  metricLabel: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "700",
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  premiumBadge: {
    backgroundColor: "#fef9c3",
    borderColor: "#facc15",
  },
  premiumBadgeText: {
    color: "#713f12",
  },
  lowStockBadge: {
    backgroundColor: "#fee2e2",
    borderColor: "#fca5a5",
  },
  lowStockBadgeText: {
    color: "#7f1d1d",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  stockText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
  reviewsSummary: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
  sectionTitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  descriptionText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 21,
  },
  disabledReason: {
    fontSize: 12,
    color: "#991b1b",
    fontWeight: "600",
  },
  addButton: {
    marginTop: 4,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#1d4ed8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  addButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  addButtonText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "700",
  },
  relatedSectionHeader: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  relatedStateBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    padding: 12,
    gap: 6,
  },
  relatedStateText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },
  relatedRetryText: {
    color: "#1d4ed8",
    fontSize: 13,
    fontWeight: "700",
  },
  relatedListContainer: {
    gap: 10,
    paddingVertical: 6,
    paddingRight: 10,
  },
  relatedItemCell: {
    width: 220,
  },
  centeredStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
    backgroundColor: "#f8fafc",
  },
  stateTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  stateSubtitle: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
  },
  actionButton: {
    marginTop: 6,
    backgroundColor: "#1d4ed8",
    borderRadius: 10,
    minHeight: 42,
    minWidth: 130,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
