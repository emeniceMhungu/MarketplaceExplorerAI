import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { ConnectivityBanner } from "@/components/connectivity-banner";
import { useAppStore } from "@/store/useAppStore";

const HIDDEN_TAB_BAR_STYLE = { display: "none" } as const;

export default function RootLayout() {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const hydrationStatus = useAppStore((state) => state.auth.hydrationStatus);
  const shouldHideTabBar = !isAuthenticated || hydrationStatus !== "ready";

  const tabsScreenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarStyle: shouldHideTabBar ? HIDDEN_TAB_BAR_STYLE : undefined,
    }),
    [shouldHideTabBar],
  );

  const protectedHref = isAuthenticated ? undefined : null;
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.rootShell}>
        <Tabs screenOptions={tabsScreenOptions}>
          <Tabs.Screen
            name="splash"
            options={{
              title: "Splash",
              href: null,
            }}
          />
          <Tabs.Screen
            name="login"
            options={{
              title: "Login",
              href: null,
            }}
          />
          <Tabs.Screen name="index" options={{ title: "Home" }} />
          <Tabs.Screen
            name="explore"
            options={{
              title: "Explore",
              href: protectedHref,
            }}
          />
          <Tabs.Screen
            name="cart"
            options={{
              title: "Cart",
              href: protectedHref,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              href: protectedHref,
            }}
          />
          <Tabs.Screen
            name="product/[id]"
            options={{
              title: "Product Details",
              href: null,
            }}
          />
        </Tabs>
        <ConnectivityBanner />
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  rootShell: {
    flex: 1,
  },
});
