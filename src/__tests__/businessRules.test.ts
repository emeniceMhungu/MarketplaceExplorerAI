import { beforeEach, describe, expect, jest, test } from "@jest/globals";

jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
    select: (values: Record<string, unknown>) => values.ios ?? values.default,
  },
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
}));

import {
  BULK_DISCOUNT_RATE,
  BULK_DISCOUNT_THRESHOLD,
  evaluateProductRules,
} from "@/domain/rulesEngine";
import { useAppStore } from "@/store/useAppStore";

describe("Business Rules Engine + Store Integration", () => {
  beforeEach(() => {
    useAppStore.getState().clearCart();
  });

  test("Rule A: premiumChoice is true when price >= 1000 and rating >= 4.5", () => {
    const result = evaluateProductRules({
      price: 1_000,
      rating: 4.5,
      stock: 20,
    });

    expect(result.premiumChoice).toBe(true);
    expect(result.canAddToCart).toBe(true);
  });

  test("Rule B: low stock is detected and maxAllowedQty equals physical stock", () => {
    const result = evaluateProductRules({
      price: 300,
      rating: 4.2,
      stock: 7,
    });

    expect(result.lowStock).toBe(true);
    expect(result.maxAllowedQty).toBe(7);
  });

  test("Rule B: addItem clamps quantity to stock ceiling for low-stock products", () => {
    const addResult = useAppStore.getState().addItem(
      {
        productId: "clamp-1",
        title: "Low Stock Headphones",
        brand: "AudioLab",
        category: "audio",
        imageUrl: "https://example.com/headphones.png",
        price: 199,
        rating: 4.1,
        stock: 5,
      },
      99,
    );

    const storedItem = useAppStore.getState().cart.items["clamp-1"];
    expect(addResult.added).toBe(true);
    expect(storedItem.quantity).toBe(5);
  });

  test("Rule C: out-of-stock and rating-below-3 products are blocked from cart", () => {
    const outOfStockAttempt = useAppStore.getState().addItem(
      {
        productId: "blocked-stock",
        title: "Unavailable Item",
        brand: "BrandX",
        category: "misc",
        imageUrl: "https://example.com/unavailable.png",
        price: 10,
        rating: 4.8,
        stock: 0,
      },
      1,
    );

    const lowRatingAttempt = useAppStore.getState().addItem(
      {
        productId: "blocked-rating",
        title: "Poorly Rated Item",
        brand: "BrandY",
        category: "misc",
        imageUrl: "https://example.com/poor.png",
        price: 10,
        rating: 2.9,
        stock: 15,
      },
      1,
    );

    expect(outOfStockAttempt.added).toBe(false);
    expect(outOfStockAttempt.reason).toContain("out of stock");
    expect(lowRatingAttempt.added).toBe(false);
    expect(lowRatingAttempt.reason).toContain("below 3.0");
  });

  test("Rule D: Zustand cart metrics apply 10% discount immediately after subtotal crosses 5000", () => {
    useAppStore.getState().addItem(
      {
        productId: "bulk-threshold",
        title: "Enterprise Monitor",
        brand: "PrimeDisplay",
        category: "electronics",
        imageUrl: "https://example.com/monitor.png",
        price: BULK_DISCOUNT_THRESHOLD,
        rating: 4.7,
        stock: 50,
      },
      1,
    );

    const atThreshold = useAppStore.getState().getCartMetrics();
    expect(atThreshold.subtotal).toBe(BULK_DISCOUNT_THRESHOLD);
    expect(atThreshold.discountRate).toBe(0);
    expect(atThreshold.discountAmount).toBe(0);

    useAppStore.getState().addItem(
      {
        productId: "bulk-cross",
        title: "Cable",
        brand: "PrimeDisplay",
        category: "electronics",
        imageUrl: "https://example.com/cable.png",
        price: 1,
        rating: 4.2,
        stock: 500,
      },
      1,
    );

    const crossed = useAppStore.getState().getCartMetrics();
    const expectedSubtotal = BULK_DISCOUNT_THRESHOLD + 1;
    const expectedDiscount = expectedSubtotal * BULK_DISCOUNT_RATE;

    expect(crossed.subtotal).toBe(expectedSubtotal);
    expect(crossed.discountRate).toBe(BULK_DISCOUNT_RATE);
    expect(crossed.discountAmount).toBeCloseTo(expectedDiscount, 5);
    expect(crossed.finalTotal).toBeCloseTo(
      expectedSubtotal - expectedDiscount,
      5,
    );
  });
});
