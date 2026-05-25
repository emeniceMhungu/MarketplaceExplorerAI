import { Link, Redirect } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { AuthLoadingView } from "@/components/auth-gate-view";
import { useAppStore } from "@/store/useAppStore";

const ROUTE_LINKS: Array<{
  href: "/search" | "/cart" | "/profile";
  label: string;
}> = [
  { href: "/search", label: "Browse Search" },
  { href: "/cart", label: "Open Cart" },
  { href: "/profile", label: "View Profile" },
];

export default function HomeScreen() {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const hydrationStatus = useAppStore((state) => state.auth.hydrationStatus);

  if (hydrationStatus !== "ready") {
    return <AuthLoadingView />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.marketplaceContainer}>
      <View style={styles.marketplaceHero}>
        <Text style={styles.marketplaceTitle}>Marketplace Explorer</Text>
        <Text style={styles.marketplaceSubtitle}>
          Authenticated baseline layout is active.
        </Text>
      </View>

      <View style={styles.marketplaceLinksContainer}>
        {ROUTE_LINKS.map((route) => (
          <Link key={route.href} href={route.href} asChild>
            <Pressable style={styles.marketplaceLinkButton}>
              <Text style={styles.marketplaceLinkText}>{route.label}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  marketplaceContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  marketplaceHero: {
    marginBottom: 20,
    gap: 8,
  },
  marketplaceTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  marketplaceSubtitle: {
    fontSize: 16,
    color: "#334155",
  },
  marketplaceLinksContainer: {
    gap: 10,
  },
  marketplaceLinkButton: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  marketplaceLinkText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
