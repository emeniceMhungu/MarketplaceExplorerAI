import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
  quantity: number;
};

export type CartState = {
  items: Record<string, CartItem>;
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
  setCartItemQuantity: (productId: string, quantity: number) => void;
  removeCartItem: (productId: string) => void;
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

const appStorage = createJSONStorage<PersistedAppState>(() => {
  if (Platform.OS === "web") {
    return localStorage;
  }

  return AsyncStorage;
});

export const useAppStore = create<AppStore>()(
  persist<AppStore, [], [], PersistedAppState>(
    (set) => ({
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
        const sessionId = `session-${Date.now()}`;

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

      setCartItemQuantity: (productId, quantity) =>
        set((state) => {
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

          return {
            cart: {
              ...state.cart,
              items: {
                ...state.cart.items,
                [productId]: {
                  productId,
                  quantity,
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
