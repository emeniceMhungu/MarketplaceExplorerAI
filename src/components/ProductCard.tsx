import { Image } from "expo-image";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { evaluateProductRules } from "@/domain/rulesEngine";

export type ProductCardProps = {
  imageUrl: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  onPress?: () => void;
  onAddToCart?: () => void;
};

function ProductCardComponent({
  imageUrl,
  title,
  brand,
  category,
  price,
  discountPercentage,
  rating,
  stock,
  onPress,
  onAddToCart,
}: ProductCardProps) {
  const rules = evaluateProductRules({
    price,
    rating,
    stock,
  });

  const stockStatusLabel = rules.lowStock
    ? `Almost Sold Out (${stock})`
    : stock > 0
      ? `${stock} in stock`
      : "Out of stock";
  const brandCategoryLabel = `${brand} • ${category}`;
  const metricsLabel = `$${price.toFixed(2)} | -${discountPercentage.toFixed(
    1,
  )}% | ★ ${rating.toFixed(1)}`;
  const addToCartDisabled =
    typeof onAddToCart !== "function" || !rules.canAddToCart;
  const detailPressDisabled = typeof onPress !== "function";

  return (
    <View style={styles.card}>
      <Pressable onPress={onPress} disabled={detailPressDisabled}>
        <Image
          source={imageUrl}
          style={styles.image}
          contentFit="cover"
          transition={150}
        />
      </Pressable>

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.brandCategory} numberOfLines={1}>
            {brandCategoryLabel}
          </Text>
        </View>

        <View style={styles.metricsContainer}>
          <Text style={styles.metricsText} numberOfLines={1}>
            {metricsLabel}
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

        <Text style={styles.stockStatus} numberOfLines={1}>
          {stockStatusLabel}
        </Text>

        {!rules.canAddToCart && rules.disabledReason ? (
          <Text style={styles.disabledReason} numberOfLines={2}>
            {rules.disabledReason}
          </Text>
        ) : null}

        <Pressable
          style={[styles.button, addToCartDisabled && styles.buttonDisabled]}
          onPress={onAddToCart}
          disabled={addToCartDisabled}
        >
          <Text style={styles.buttonText}>
            {rules.canAddToCart ? "Add to Cart" : "Unavailable"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export const ProductCard = memo(ProductCardComponent);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 168,
    backgroundColor: "#e2e8f0",
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 8,
  },
  headerSection: {
    gap: 2,
    minHeight: 58,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 20,
  },
  brandCategory: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "capitalize",
  },
  metricsContainer: {
    minHeight: 20,
    justifyContent: "center",
  },
  metricsText: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "700",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    minHeight: 22,
    alignItems: "center",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
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
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  stockStatus: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  disabledReason: {
    fontSize: 11,
    color: "#991b1b",
    fontWeight: "600",
    lineHeight: 15,
    minHeight: 15,
  },
  button: {
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: "#1d4ed8",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
