import { StyleSheet, Text, View } from "react-native";

type ScreenStubProps = {
  title: string;
  description: string;
};

export function ScreenStub({ title, description }: ScreenStubProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#334155",
    lineHeight: 22,
  },
});
