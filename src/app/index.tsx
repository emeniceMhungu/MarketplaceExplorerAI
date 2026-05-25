import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const ROUTE_LINKS: Array<{
  href: "/search" | "/cart" | "/profile" | "/login" | "/splash";
  label: string;
}> = [
  { href: "/search", label: "Go to Search stub" },
  { href: "/cart", label: "Go to Cart stub" },
  { href: "/profile", label: "Go to Profile stub" },
  { href: "/login", label: "Open Login stub" },
  { href: "/splash", label: "Open Splash stub" },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Marketplace Explorer</Text>
      <Text style={styles.subtitle}>Phase 1 navigation entry placeholder</Text>

      <View style={styles.linksContainer}>
        {ROUTE_LINKS.map((route) => (
          <Link key={route.href} href={route.href} asChild>
            <Pressable style={styles.linkButton}>
              <Text style={styles.linkText}>{route.label}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 12,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 16,
    color: "#334155",
    marginBottom: 8,
  },
  linksContainer: {
    gap: 10,
  },
  linkButton: {
    backgroundColor: "#1d4ed8",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  linkText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
