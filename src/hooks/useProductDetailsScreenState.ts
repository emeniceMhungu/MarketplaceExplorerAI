import { useMemo } from "react";
import { Dimensions } from "react-native";

import { evaluateProductRules } from "@/domain/rulesEngine";
import { ProductDetails, useProductDetails } from "@/hooks/useProductDetails";
import { RelatedProduct, useRelatedProducts } from "@/hooks/useRelatedProducts";
import { useAppStore } from "@/store/useAppStore";

const GALLERY_HORIZONTAL_MARGIN = 12;
export const PRODUCT_DETAILS_GALLERY_ITEM_WIDTH =
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

export type UseProductDetailsScreenStateParams = {
  id: string | string[] | undefined;
  from: string | string[] | undefined;
};

export type UseProductDetailsScreenStateResult = {
  isAuthenticated: boolean;
  showAuthLoadingState: boolean;
  shouldRedirectToLogin: boolean;
  showInvalidProductState: boolean;
  showLoadingState: boolean;
  showErrorState: boolean;
  sourceRoute: "/" | "/explore";
  sourceParam: "index" | "explore";
  product: ProductDetails;
  rules: ReturnType<typeof evaluateProductRules>;
  addToCartDisabled: boolean;
  reviewCount: number;
  averageReviewRating: number;
  detailsErrorMessage: string | null;
  retryDetails: () => Promise<void>;
  galleryImages: string[];
  gallerySingleImageCentered:
    | {
        flexGrow: 1;
        justifyContent: "center";
        alignItems: "center";
      }
    | undefined;
  relatedProducts: RelatedProduct[];
  showRelatedLoadingState: boolean;
  showRelatedErrorState: boolean;
  showRelatedEmptyState: boolean;
  relatedErrorMessage: string | null;
  retryRelated: () => Promise<void>;
  addCurrentProductToCart: () => void;
  addRelatedProductToCart: (item: RelatedProduct) => void;
};

export function useProductDetailsScreenState({
  id,
  from,
}: UseProductDetailsScreenStateParams): UseProductDetailsScreenStateResult {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const hydrationStatus = useAppStore((state) => state.auth.hydrationStatus);
  const addItem = useAppStore((state) => state.addItem);

  const productId = useMemo(() => resolveProductId(id), [id]);
  const sourceRoute = useMemo(() => {
    const source = Array.isArray(from) ? from[0] : from;
    return source === "explore" ? "/explore" : "/";
  }, [from]);
  const sourceParam = sourceRoute === "/explore" ? "explore" : "index";

  const detailsQuery = useProductDetails(
    productId,
    isAuthenticated && hydrationStatus === "ready",
  );

  const fallbackProduct: ProductDetails = {
    id: 0,
    title: "",
    description: "",
    brand: "",
    category: "",
    price: 0,
    discountPercentage: 0,
    rating: 0,
    stock: 0,
    imageUrl: "",
    images: [],
    reviews: [],
  };

  const relatedQuery = useRelatedProducts({
    category: detailsQuery.product?.category ?? null,
    currentProductId: detailsQuery.product?.id ?? null,
    enabled:
      isAuthenticated && hydrationStatus === "ready" && !!detailsQuery.product,
    limit: 8,
  });

  const product = detailsQuery.product ?? fallbackProduct;
  const rules = product
    ? evaluateProductRules({
        price: product.price,
        rating: product.rating,
        stock: product.stock,
      })
    : {
        premiumChoice: false,
        lowStock: false,
        maxAllowedQty: 0,
        canAddToCart: false,
        disabledReason: "Product unavailable",
      };

  const averageReviewRating = product
    ? product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
        product.reviews.length
      : product.rating
    : 0;
  const reviewCount = product.reviews.length;

  const galleryImages = product
    ? product.images.length > 0
      ? product.images
      : [product.imageUrl]
    : [];

  const gallerySingleImageCentered =
    galleryImages.length === 1
      ? ({
          flexGrow: 1,
          justifyContent: "center" as const,
          alignItems: "center" as const,
        } as const)
      : undefined;

  const addCurrentProductToCart = () => {
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
  };

  const addRelatedProductToCart = (item: RelatedProduct) => {
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
  };

  return {
    isAuthenticated,
    showAuthLoadingState: hydrationStatus !== "ready",
    shouldRedirectToLogin: hydrationStatus === "ready" && !isAuthenticated,
    showInvalidProductState: productId === null,
    showLoadingState: detailsQuery.showLoadingState,
    showErrorState: detailsQuery.showErrorState,
    sourceRoute,
    sourceParam,
    product,
    rules,
    addToCartDisabled: !rules.canAddToCart,
    reviewCount,
    averageReviewRating,
    detailsErrorMessage: detailsQuery.errorMessage,
    retryDetails: detailsQuery.retry,
    galleryImages,
    gallerySingleImageCentered,
    relatedProducts: relatedQuery.products,
    showRelatedLoadingState: relatedQuery.showLoadingState,
    showRelatedErrorState: relatedQuery.showErrorState,
    showRelatedEmptyState: relatedQuery.showEmptyState,
    relatedErrorMessage: relatedQuery.errorMessage,
    retryRelated: relatedQuery.retry,
    addCurrentProductToCart,
    addRelatedProductToCart,
  };
}
