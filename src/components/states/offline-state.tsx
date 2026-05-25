import { Pressable, StyleSheet, Text, View } from "react-native";

type OfflineStateProps = {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function OfflineState({
  title = "No internet connection",
  message = "Reconnect to continue browsing products.",
  retryLabel = "Retry",
  onRetry,
}: OfflineStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable style={styles.actionButton} onPress={onRetry}>
          <Text style={styles.actionButtonText}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
  },
  actionButton: {
    marginTop: 6,
    backgroundColor: "#1d4ed8",
    borderRadius: 10,
    minHeight: 42,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
