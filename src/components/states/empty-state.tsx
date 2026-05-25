import { StyleSheet, Text, View } from "react-native";

type EmptyStateProps = {
  title?: string;
  message: string;
};

export function EmptyState({ title = "No results", message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
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
});
