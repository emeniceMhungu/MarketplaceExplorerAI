import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs } from "expo-router";
import { useState } from "react";

export default function RootLayout() {
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
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="splash"
          options={{
            title: "Splash",
            href: null,
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="login"
          options={{
            title: "Login",
            href: null,
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="search" options={{ title: "Search" }} />
        <Tabs.Screen name="cart" options={{ title: "Cart" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
    </QueryClientProvider>
  );
}
