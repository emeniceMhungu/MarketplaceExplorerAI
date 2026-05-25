import { Redirect } from "expo-router";

import { AuthGateView, AuthLoadingView } from "@/components/auth-gate-view";
import { useAppStore } from "@/store/useAppStore";

export default function LoginScreen() {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const isLoading = useAppStore((state) => state.auth.isLoading);
  const hydrationStatus = useAppStore((state) => state.auth.hydrationStatus);
  const login = useAppStore((state) => state.login);

  if (hydrationStatus !== "ready") {
    return <AuthLoadingView />;
  }

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  return <AuthGateView isLoading={isLoading} onSubmit={login} />;
}
