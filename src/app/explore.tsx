import { Redirect } from "expo-router";

import { AuthLoadingView } from "@/components/auth-gate-view";
import { useAppStore } from "@/store/useAppStore";

export default function ExploreScreen() {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const hydrationStatus = useAppStore((state) => state.auth.hydrationStatus);

  if (hydrationStatus !== "ready") {
    return <AuthLoadingView />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/search" />;
}
