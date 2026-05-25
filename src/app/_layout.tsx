import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs } from "expo-router";
import { useState } from "react";

import { useAppStore } from "@/store/useAppStore";

export default function RootLayout() {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const hydrationStatus = useAppStore((state) => state.auth.hydrationStatus);
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
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle:
            !isAuthenticated || hydrationStatus !== "ready"
              ? { display: "none" }
              : undefined,
        }}
      >
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
          name="search"
          options={{
            title: "Search",
            href: isAuthenticated ? undefined : null,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: "Cart",
            href: isAuthenticated ? undefined : null,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            href: isAuthenticated ? undefined : null,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            href: null,
          }}
        />
      </Tabs>
    </QueryClientProvider>
  );
}
