import { useAppStore } from "@/store/useAppStore";

export type UseProfileScreenStateResult = {
  isAuthenticated: boolean;
  showLoadingState: boolean;
  shouldRedirectToLogin: boolean;
  userEmail: string | null;
  sessionId: string | null;
  logout: () => void;
};

export function useProfileScreenState(): UseProfileScreenStateResult {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const hydrationStatus = useAppStore((state) => state.auth.hydrationStatus);
  const userEmail = useAppStore((state) => state.auth.userEmail);
  const sessionId = useAppStore((state) => state.auth.sessionId);
  const logout = useAppStore((state) => state.logout);

  return {
    isAuthenticated,
    showLoadingState: hydrationStatus !== "ready",
    shouldRedirectToLogin: hydrationStatus === "ready" && !isAuthenticated,
    userEmail,
    sessionId,
    logout,
  };
}
