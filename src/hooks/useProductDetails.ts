import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const PRODUCTS_ENDPOINT = "https://dummyjson.com/products";

type DummyJsonReview = {
  rating?: number;
  comment?: string;
  reviewerName?: string;
  reviewerEmail?: string;
  date?: string;
};

type DummyJsonProductDetailsResponse = {
  id: number;
  title: string;
  description?: string;
  category?: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  thumbnail?: string;
  images?: string[];
  reviews?: DummyJsonReview[];
};

export type ProductReview = {
  rating: number;
  comment: string;
  reviewerName: string;
};

export type ProductDetails = {
  id: number;
  title: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  imageUrl: string;
  images: string[];
  reviews: ProductReview[];
};

export type UseProductDetailsResult = {
  product: ProductDetails | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  retry: () => Promise<void>;
};

function normalizeProduct(
  payload: DummyJsonProductDetailsResponse,
): ProductDetails {
  const images = Array.isArray(payload.images)
    ? payload.images.filter((image): image is string =>
        Boolean(image && image.trim()),
      )
    : [];

  const fallbackImage =
    payload.thumbnail ??
    "https://dummyjson.com/image/800x600/edf2f7/475569?text=Product";

  const primaryImage = images[0] ?? fallbackImage;

  const normalizedReviews = Array.isArray(payload.reviews)
    ? payload.reviews.map((review) => ({
        rating: Number.isFinite(review.rating) ? Number(review.rating) : 0,
        comment: review.comment?.trim() || "No comment provided.",
        reviewerName: review.reviewerName?.trim() || "Verified buyer",
      }))
    : [];

  return {
    id: payload.id,
    title: payload.title,
    description:
      payload.description?.trim() || "No product description available.",
    brand: payload.brand?.trim() || "Independent Brand",
    category: payload.category?.trim() || "general",
    price: payload.price,
    discountPercentage: payload.discountPercentage,
    rating: payload.rating,
    stock: payload.stock,
    imageUrl: primaryImage,
    images: images.length > 0 ? images : [primaryImage],
    reviews: normalizedReviews,
  };
}

async function fetchProductDetails(
  productId: number,
  signal?: AbortSignal,
): Promise<ProductDetails> {
  const response = await fetch(`${PRODUCTS_ENDPOINT}/${productId}`, { signal });

  if (!response.ok) {
    throw new Error(`Unable to load product details (${response.status})`);
  }

  const payload = (await response.json()) as DummyJsonProductDetailsResponse;
  return normalizeProduct(payload);
}

export function useProductDetails(
  productId: number | null,
  enabled = true,
): UseProductDetailsResult {
  const query = useQuery({
    queryKey: ["products", "details", productId],
    enabled: enabled && typeof productId === "number" && productId > 0,
    queryFn: ({ signal }) => fetchProductDetails(productId as number, signal),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const product = useMemo(() => query.data ?? null, [query.data]);

  return {
    product,
    isLoading: query.isPending,
    isError: query.isError,
    errorMessage: query.error instanceof Error ? query.error.message : null,
    retry: async () => {
      await query.refetch();
    },
  };
}
