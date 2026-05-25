import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  evaluateCartMetrics,
  evaluateProductRules,
} from "@/domain/rulesEngine";

export type SortOption = "none" | "priceAsc" | "priceDesc" | "highestRated";

export type AuthState = {
  isAuthenticated: boolean;
  userEmail: string | null;
  sessionId: string | null;
  isLoading: boolean;
  hydrationStatus: "pending" | "ready";
};

export type FilterState = {
  searchQuery: string;
  category: string | null;
  sort: SortOption;
};

export type CartItem = {
  productId: string;
  title: string;
  brand: string;
  category: string;
  imageUrl: string;
  price: number;
  rating: number;
  stock: number;
  quantity: number;
};

export type CartState = {
  items: Record<string, CartItem>;
};

export type CartMetrics = {
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  finalTotal: number;
  itemCount: number;
  uniqueItemCount: number;
};

export type CartProductInput = {
  productId: string | number;
  title: string;
  brand: string;
  category: string;
  imageUrl: string;
  price: number;
  rating: number;
  stock: number;
};

export type AddItemResult = {
  added: boolean;
  quantity: number;
  reason: string | null;
};

export type PersistedAppState = {
  auth: AuthState;
  filter: FilterState;
  cart: CartState;
};

export type AppStore = {
  auth: AuthState;
  filter: FilterState;
  cart: CartState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setSearchQuery: (searchQuery: string) => void;
  setCategory: (category: string | null) => void;
  setSort: (sort: SortOption) => void;
  clearFilters: () => void;
  addItem: (product: CartProductInput, quantity?: number) => AddItemResult;
  removeItem: (productId: string | number) => void;
  incrementItemQuantity: (productId: string | number) => void;
  decrementItemQuantity: (productId: string | number) => void;
  setCartItemQuantity: (productId: string, quantity: number) => void;
  removeCartItem: (productId: string) => void;
  getCartMetrics: () => CartMetrics;
  clearCart: () => void;
};

const INITIAL_AUTH_STATE: AuthState = {
  isAuthenticated: false,
  userEmail: null,
  sessionId: null,
  isLoading: false,
  hydrationStatus: "pending",
};

const INITIAL_FILTER_STATE: FilterState = {
  searchQuery: "",
  category: null,
  sort: "none",
};

const INITIAL_CART_STATE: CartState = {
  items: {},
};

const AUTH_SIMULATION_DELAY_MS = 1_000;

const EMPTY_CART_METRICS: CartMetrics = {
  subtotal: 0,
  discountRate: 0,
  discountAmount: 0,
  finalTotal: 0,
  itemCount: 0,
  uniqueItemCount: 0,
};

function normalizeProductId(productId: string | number): string {
  return String(productId);
}

function normalizeRequestedQuantity(quantity: number | undefined): number {
  if (typeof quantity !== "number" || !Number.isFinite(quantity)) {
    return 1;
  }

  return Math.max(1, Math.floor(quantity));
}

function clampQuantity(quantity: number, maxAllowedQty: number): number {
  if (maxAllowedQty <= 0) {
    return 0;
  }

  return Math.max(1, Math.min(quantity, maxAllowedQty));
}

function buildCartItem(
  product: CartProductInput,
  quantity: number,
  maxAllowedQty: number,
): CartItem {
  return {
    productId: normalizeProductId(product.productId),
    title: product.title,
    brand: product.brand,
    category: product.category,
    imageUrl: product.imageUrl,
    price: product.price,
    rating: product.rating,
    stock: maxAllowedQty,
    quantity,
  };
}

function deriveCartMetrics(items: Record<string, CartItem>): CartMetrics {
  const entries = Object.values(items);

  if (entries.length === 0) {
    return EMPTY_CART_METRICS;
  }

  let subtotal = 0;
  let itemCount = 0;

  for (const item of entries) {
    subtotal += item.price * item.quantity;
    itemCount += item.quantity;
  }

  const pricing = evaluateCartMetrics(subtotal);

  return {
    ...pricing,
    itemCount,
    uniqueItemCount: entries.length,
  };
}

const appStorage = createJSONStorage<PersistedAppState>(() => {
  if (Platform.OS === "web") {
    return localStorage;
  }

  return AsyncStorage;
});

export const useAppStore = create<AppStore>()(
  persist<AppStore, [], [], PersistedAppState>(
    (set, get) => ({
      auth: INITIAL_AUTH_STATE,
      filter: INITIAL_FILTER_STATE,
      cart: INITIAL_CART_STATE,

      login: async (email: string, _password: string) => {
        set((state) => ({
          auth: {
            ...state.auth,
            isLoading: true,
          },
        }));

        await new Promise<void>((resolve) => {
          setTimeout(() => resolve(), AUTH_SIMULATION_DELAY_MS);
        });

        const normalizedEmail = email.trim().toLowerCase();
        const sessionId = "session-" + Date.now();

        set((state) => ({
          auth: {
            ...state.auth,
            isAuthenticated: true,
            userEmail: normalizedEmail,
            sessionId,
            isLoading: false,
            hydrationStatus: "ready",
          },
        }));
      },

      logout: () =>
        set((state) => ({
          auth: {
            ...state.auth,
            isAuthenticated: false,
            userEmail: null,
            sessionId: null,
            isLoading: false,
            hydrationStatus: "ready",
          },
          cart: {
            ...state.cart,
            items: {},
          },
        })),

      setSearchQuery: (searchQuery) =>
        set((state) => ({
          filter: {
            ...state.filter,
            searchQuery,
          },
        })),

      setCategory: (category) =>
        set((state) => ({
          filter: {
            ...state.filter,
            category,
          },
        })),

      setSort: (sort) =>
        set((state) => ({
          filter: {
            ...state.filter,
            sort,
          },
        })),

      clearFilters: () =>
        set(() => ({
          filter: INITIAL_FILTER_STATE,
        })),

      addItem: (product, quantity = 1) => {
        const rules = evaluateProductRules({
          price: product.price,
          rating: product.rating,
          stock: product.stock,
        });

        if (!rules.canAddToCart) {
          return {
            added: false,
            quantity: 0,
            reason: rules.disabledReason,
          };
        }

        const requestedQuantity = normalizeRequestedQuantity(quantity);
        const productId = normalizeProductId(product.productId);

        let nextQuantity = 0;
        let addResult: AddItemResult = {
          added: false,
          quantity: 0,
          reason: null,
        };

        set((state) => {
          const currentItem = state.cart.items[productId];
          const currentQty = currentItem?.quantity ?? 0;
          const candidateQty = currentQty + requestedQuantity;
          nextQuantity = clampQuantity(candidateQty, rules.maxAllowedQty);

          if (nextQuantity <= 0 || nextQuantity === currentQty) {
            addResult = {
              added: false,
              quantity: currentQty,
              reason: "Maximum available stock reached.",
            };
            return state;
          }

          addResult = {
            added: true,
            quantity: nextQuantity,
            reason: null,
          };

          return {
            cart: {
              ...state.cart,
              items: {
                ...state.cart.items,
                [productId]: buildCartItem(
                  product,
                  nextQuantity,
                  rules.maxAllowedQty,
                ),
              },
            },
          };
        });

        return addResult;
      },

      removeItem: (productId) =>
        set((state) => {
          const normalizedProductId = normalizeProductId(productId);
          const nextItems = { ...state.cart.items };
          delete nextItems[normalizedProductId];
          return {
            cart: {
              ...state.cart,
              items: nextItems,
            },
          };
        }),

      incrementItemQuantity: (productId) =>
        set((state) => {
          const normalizedProductId = normalizeProductId(productId);
          const currentItem = state.cart.items[normalizedProductId];

          if (!currentItem) {
            return state;
          }

          const rules = evaluateProductRules({
            price: currentItem.price,
            rating: currentItem.rating,
            stock: currentItem.stock,
          });

          if (!rules.canAddToCart) {
            return state;
          }

          const nextQuantity = clampQuantity(
            currentItem.quantity + 1,
            rules.maxAllowedQty,
          );

          if (nextQuantity === currentItem.quantity) {
            return state;
          }

          return {
            cart: {
              ...state.cart,
              items: {
                ...state.cart.items,
                [normalizedProductId]: {
                  ...currentItem,
                  quantity: nextQuantity,
                },
              },
            },
          };
        }),

      decrementItemQuantity: (productId) =>
        set((state) => {
          const normalizedProductId = normalizeProductId(productId);
          const currentItem = state.cart.items[normalizedProductId];

          if (!currentItem) {
            return state;
          }

          const nextQuantity = currentItem.quantity - 1;
          if (nextQuantity <= 0) {
            const nextItems = { ...state.cart.items };
            delete nextItems[normalizedProductId];
            return {
              cart: {
                ...state.cart,
                items: nextItems,
              },
            };
          }

          return {
            cart: {
              ...state.cart,
              items: {
                ...state.cart.items,
                [normalizedProductId]: {
                  ...currentItem,
                  quantity: nextQuantity,
                },
              },
            },
          };
        }),

      setCartItemQuantity: (productId, quantity) =>
        set((state) => {
          const currentItem = state.cart.items[productId];
          if (!currentItem) {
            return state;
          }

          if (quantity <= 0) {
            const nextItems = { ...state.cart.items };
            delete nextItems[productId];
            return {
              cart: {
                ...state.cart,
                items: nextItems,
              },
            };
          }

          const rules = evaluateProductRules({
            price: currentItem.price,
            rating: currentItem.rating,
            stock: currentItem.stock,
          });

          if (!rules.canAddToCart) {
            const nextItems = { ...state.cart.items };
            delete nextItems[productId];
            return {
              cart: {
                ...state.cart,
                items: nextItems,
              },
            };
          }

          const nextQuantity = clampQuantity(
            Math.floor(quantity),
            rules.maxAllowedQty,
          );

          return {
            cart: {
              ...state.cart,
              items: {
                ...state.cart.items,
                [productId]: {
                  ...currentItem,
                  quantity: nextQuantity,
                },
              },
            },
          };
        }),

      removeCartItem: (productId) =>
        set((state) => {
          const nextItems = { ...state.cart.items };
          delete nextItems[productId];
          return {
            cart: {
              ...state.cart,
              items: nextItems,
            },
          };
        }),

      getCartMetrics: () => deriveCartMetrics(get().cart.items),

      clearCart: () =>
        set((state) => ({
          cart: {
            ...state.cart,
            items: {},
          },
        })),
    }),
    {
      name: "marketplace-app-store",
      storage: appStorage,
      partialize: (state): PersistedAppState => ({
        auth: {
          ...state.auth,
          isLoading: false,
          hydrationStatus: "ready" as const,
        },
        filter: state.filter,
        cart: state.cart,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }

        state.auth.hydrationStatus = "ready";
        state.auth.isLoading = false;
      },
    },
  ),
);
