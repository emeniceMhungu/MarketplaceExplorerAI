export type RulesProductInput = {
  price: number;
  rating: number;
  stock: number;
};

export type ProductRuleResult = {
  premiumChoice: boolean;
  lowStock: boolean;
  maxAllowedQty: number;
  canAddToCart: boolean;
  disabledReason: string | null;
};

export type CartMetrics = {
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  finalTotal: number;
};

export const BULK_DISCOUNT_THRESHOLD = 5_000;
export const BULK_DISCOUNT_RATE = 0.1;

export function evaluateProductRules(
  product: RulesProductInput,
): ProductRuleResult {
  const stock = Number.isFinite(product.stock)
    ? Math.max(0, Math.floor(product.stock))
    : 0;
  const rating = Number.isFinite(product.rating) ? product.rating : 0;
  const price = Number.isFinite(product.price) ? product.price : 0;

  const premiumChoice = rating >= 4.5 && price >= 1_000;
  const lowStock = stock < 10;
  const canAddToCart = stock > 0 && rating >= 3;

  let disabledReason: string | null = null;
  if (stock === 0) {
    disabledReason = "Unavailable: this product is out of stock.";
  } else if (rating < 3) {
    disabledReason = "Unavailable: product rating is below 3.0.";
  }

  return {
    premiumChoice,
    lowStock,
    maxAllowedQty: stock,
    canAddToCart,
    disabledReason,
  };
}

export function evaluateCartMetrics(subtotal: number): CartMetrics {
  const normalizedSubtotal = Number.isFinite(subtotal)
    ? Math.max(0, subtotal)
    : 0;
  const qualifiesForBulkDiscount = normalizedSubtotal > BULK_DISCOUNT_THRESHOLD;
  const discountRate = qualifiesForBulkDiscount ? BULK_DISCOUNT_RATE : 0;
  const discountAmount = normalizedSubtotal * discountRate;
  const finalTotal = normalizedSubtotal - discountAmount;

  return {
    subtotal: normalizedSubtotal,
    discountRate,
    discountAmount,
    finalTotal,
  };
}
