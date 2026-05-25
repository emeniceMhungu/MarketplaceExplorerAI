import { Image } from "expo-image";
import { Redirect } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthLoadingView } from "@/components/auth-gate-view";
import { BULK_DISCOUNT_THRESHOLD } from "@/domain/rulesEngine";
import { useCartScreenState } from "@/hooks/useCartScreenState";

export default function CartScreen() {
  const {
    shouldRedirectToLogin,
    showLoadingState,
    showEmptyState,
    cartItems,
    itemCount,
    uniqueItemCount,
    subtotal,
    discountAmount,
    finalTotal,
    hasBulkDiscount,
    thresholdGap,
    incrementItemQuantity,
    decrementItemQuantity,
    removeItem,
    clearCart,
  } = useCartScreenState();

  if (showLoadingState) {
    return <AuthLoadingView />;
  }

  if (shouldRedirectToLogin) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <Text style={styles.headerSubtitle}>
          {itemCount} items across {uniqueItemCount} products
        </Text>
      </View>

      {showEmptyState ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>Your cart is empty</Text>
          <Text style={styles.emptyStateText}>
            Add products from Home or Explore to start calculating offers.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.itemsContainer}>
            {cartItems.map((item) => (
              <View key={item.productId} style={styles.itemCard}>
                <Image
                  source={item.imageUrl}
                  style={styles.itemImage}
                  contentFit="cover"
                />

                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemMeta} numberOfLines={1}>
                    {item.brand} • {item.category}
                  </Text>
                  <Text style={styles.itemMeta}>
                    Unit: ${item.price.toFixed(2)}
                  </Text>
                  <Text style={styles.itemMeta}>Stock cap: {item.stock}</Text>
                </View>

                <View style={styles.itemActionsColumn}>
                  <Text style={styles.itemLineTotal}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>

                  <View style={styles.quantityStepper}>
                    <Pressable
                      style={styles.stepperButton}
                      onPress={() => decrementItemQuantity(item.productId)}
                    >
                      <Text style={styles.stepperButtonText}>-</Text>
                    </Pressable>

                    <Text style={styles.quantityText}>{item.quantity}</Text>

                    <Pressable
                      style={styles.stepperButton}
                      onPress={() => incrementItemQuantity(item.productId)}
                    >
                      <Text style={styles.stepperButtonText}>+</Text>
                    </Pressable>
                  </View>

                  <Pressable
                    style={styles.removeButton}
                    onPress={() => removeItem(item.productId)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>

            {hasBulkDiscount ? (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Bulk discount (10%)</Text>
                  <Text style={styles.discountValue}>
                    -${discountAmount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Final total</Text>
                  <Text style={styles.totalValue}>
                    ${finalTotal.toFixed(2)}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.thresholdHint}>
                Add ${thresholdGap.toFixed(2)} more to unlock 10% off above $
                {BULK_DISCOUNT_THRESHOLD.toFixed(2)}.
              </Text>
            )}

            <Pressable style={styles.clearCartButton} onPress={clearCart}>
              <Text style={styles.clearCartButtonText}>Clear cart</Text>
            </Pressable>
          </View>
        </>
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
    paddingBottom: 10,
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#475569",
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  itemsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    gap: 10,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 10,
    gap: 10,
  },
  itemImage: {
    width: 84,
    height: 84,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
  },
  itemDetails: {
    flex: 1,
    gap: 3,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  itemMeta: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "capitalize",
  },
  itemActionsColumn: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    minWidth: 100,
    gap: 6,
  },
  itemLineTotal: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "700",
  },
  quantityStepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    overflow: "hidden",
  },
  stepperButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0",
  },
  stepperButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 20,
  },
  quantityText: {
    width: 36,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  removeButton: {
    borderRadius: 8,
    backgroundColor: "#fee2e2",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removeButtonText: {
    color: "#991b1b",
    fontSize: 12,
    fontWeight: "700",
  },
  summaryCard: {
    marginHorizontal: 12,
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: "#ffffff",
    padding: 12,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "700",
  },
  discountValue: {
    fontSize: 13,
    color: "#166534",
    fontWeight: "700",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "800",
  },
  totalValue: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "800",
  },
  thresholdHint: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  clearCartButton: {
    marginTop: 4,
    alignSelf: "flex-start",
    borderRadius: 10,
    backgroundColor: "#1e293b",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearCartButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
});
