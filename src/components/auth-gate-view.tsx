import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

type AuthGateViewProps = {
  isLoading: boolean;
  onSubmit: (email: string, password: string) => Promise<void>;
};

export function AuthGateView({ isLoading, onSubmit }: AuthGateViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const emailValid = useMemo(() => EMAIL_REGEX.test(email.trim()), [email]);
  const passwordValid = useMemo(
    () => PASSWORD_REGEX.test(password),
    [password],
  );
  const canSubmit = emailValid && passwordValid && !isLoading;

  const handleSubmit = async () => {
    if (!canSubmit) {
      setSubmitError(
        "Enter a valid email and a password with at least 8 characters, including a number.",
      );
      return;
    }

    setSubmitError(null);
    await onSubmit(email, password);
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <View style={styles.authCard}>
        <Text style={styles.authTitle}>Welcome back</Text>
        <Text style={styles.authSubtitle}>
          Sign in to continue to Marketplace Explorer.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        {!emailValid && email.length > 0 ? (
          <Text style={styles.validationText}>
            Enter a valid email address.
          </Text>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {!passwordValid && password.length > 0 ? (
          <Text style={styles.validationText}>
            Password must be at least 8 characters and include a number.
          </Text>
        ) : null}

        {submitError ? (
          <Text style={styles.submitErrorText}>{submitError}</Text>
        ) : null}

        <Pressable
          style={[styles.loginButton, !canSubmit && styles.loginButtonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.loginButtonText}>Sign in</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

type AuthLoadingViewProps = {
  message?: string;
};

export function AuthLoadingView({
  message = "Restoring session...",
}: AuthLoadingViewProps) {
  return (
    <View style={styles.loaderScreen}>
      <ActivityIndicator size="large" color="#1d4ed8" />
      <Text style={styles.loaderText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f8fafc",
  },
  loaderText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "500",
  },
  authContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  authCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
  },
  authSubtitle: {
    fontSize: 15,
    color: "#475569",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
  validationText: {
    color: "#b91c1c",
    fontSize: 12,
    marginTop: -4,
    marginBottom: 4,
  },
  submitErrorText: {
    color: "#991b1b",
    fontSize: 13,
    marginTop: 4,
  },
  loginButton: {
    backgroundColor: "#1d4ed8",
    borderRadius: 10,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  loginButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
