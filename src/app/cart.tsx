import { Redirect } from "expo-router";

import { AuthLoadingView } from "@/components/auth-gate-view";
import { ScreenStub } from "@/components/screen-stub";
import { useAppStore } from "@/store/useAppStore";

export default function CartScreen() {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const hydrationStatus = useAppStore((state) => state.auth.hydrationStatus);

  if (hydrationStatus !== "ready") {
    return <AuthLoadingView />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <ScreenStub
      title="Cart"
      description="Phase 1 cart route stub. Cart business logic and persistence are intentionally deferred."
    />
  );
}
