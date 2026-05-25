import { create } from "zustand";

export type SortOption = "none" | "priceAsc" | "priceDesc" | "highestRated";

export type AuthState = {
  isAuthenticated: boolean;
  sessionId: string | null;
  isBootstrapping: boolean;
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

export type AppStore = {
  auth: AuthState;
  filter: FilterState;
  cart: CartState;
  bootstrapSession: () => void;
  finishBootstrap: () => void;
  loginStub: (sessionId?: string) => void;
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
  sessionId: null,
  isBootstrapping: true,
};

const INITIAL_FILTER_STATE: FilterState = {
  searchQuery: "",
  category: null,
  sort: "none",
};

const INITIAL_CART_STATE: CartState = {
  items: {},
};

export const useAppStore = create<AppStore>()((set) => ({
  auth: INITIAL_AUTH_STATE,
  filter: INITIAL_FILTER_STATE,
  cart: INITIAL_CART_STATE,

  bootstrapSession: () =>
    set((state) => ({
      auth: {
        ...state.auth,
        isBootstrapping: true,
      },
    })),

  finishBootstrap: () =>
    set((state) => ({
      auth: {
        ...state.auth,
        isBootstrapping: false,
      },
    })),

  loginStub: (sessionId = "phase-1-session") =>
    set((state) => ({
      auth: {
        ...state.auth,
        isAuthenticated: true,
        sessionId,
        isBootstrapping: false,
      },
    })),

  logout: () =>
    set((state) => ({
      auth: {
        ...state.auth,
        isAuthenticated: false,
        sessionId: null,
        isBootstrapping: false,
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
}));
