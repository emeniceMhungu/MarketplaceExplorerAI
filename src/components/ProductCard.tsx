import { Image } from "expo-image";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type ProductCardProps = {
  imageUrl: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
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
  onAddToCart,
}: ProductCardProps) {
  const stockStatusLabel = stock > 0 ? `${stock} in stock` : "Out of stock";
  const brandCategoryLabel = `${brand} • ${category}`;
  const metricsLabel = `$${price.toFixed(2)} | -${discountPercentage.toFixed(
    1,
  )}% | ★ ${rating.toFixed(1)}`;
  const addToCartDisabled = typeof onAddToCart !== "function";

  return (
    <View style={styles.card}>
      <Image
        source={imageUrl}
        style={styles.image}
        contentFit="cover"
        transition={150}
      />

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

        <Text style={styles.stockStatus} numberOfLines={1}>
          {stockStatusLabel}
        </Text>

        <Pressable
          style={[styles.button, addToCartDisabled && styles.buttonDisabled]}
          onPress={onAddToCart}
          disabled={addToCartDisabled}
        >
          <Text style={styles.buttonText}>Add to Cart</Text>
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
  stockStatus: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
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
