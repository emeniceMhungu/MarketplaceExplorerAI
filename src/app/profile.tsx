import { Redirect } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { AuthLoadingView } from "@/components/auth-gate-view";
import { useAppStore } from "@/store/useAppStore";

export default function ProfileScreen() {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const hydrationStatus = useAppStore((state) => state.auth.hydrationStatus);
  const userEmail = useAppStore((state) => state.auth.userEmail);
  const sessionId = useAppStore((state) => state.auth.sessionId);
  const logout = useAppStore((state) => state.logout);

  if (hydrationStatus !== "ready") {
    return <AuthLoadingView />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Session and authentication details</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Authenticated</Text>
          <Text style={styles.value}>{isAuthenticated ? "Yes" : "No"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{userEmail ?? "Not available"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Session ID</Text>
          <Text style={styles.value}>{sessionId ?? "Not available"}</Text>
        </View>

        <Pressable style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 8,
  },
  row: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: "#dc2626",
    minHeight: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
