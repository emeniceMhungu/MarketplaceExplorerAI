import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNetworkStatus } from "@/hooks/useNetworkStatus";

const RECONNECTED_BANNER_DURATION_MS = 2200;

export function ConnectivityBanner() {
  const { isOffline } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const wasOfflineRef = useRef(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (isOffline) {
      wasOfflineRef.current = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      const timeoutId = setTimeout(() => {
        setShowReconnected(false);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
      };
    }

    if (!wasOfflineRef.current) {
      return;
    }

    const showTimeoutId = setTimeout(() => {
      setShowReconnected(true);
      reconnectTimeoutRef.current = setTimeout(() => {
        setShowReconnected(false);
        wasOfflineRef.current = false;
      }, RECONNECTED_BANNER_DURATION_MS);
    }, 0);

    return () => {
      clearTimeout(showTimeoutId);

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [isOffline]);

  if (!isOffline && !showReconnected) {
    return null;
  }

  const bannerMode = isOffline ? "offline" : "online";

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, 8) + 6 },
        bannerMode === "offline"
          ? styles.offlineContainer
          : styles.onlineContainer,
      ]}
    >
      <Text style={styles.titleText}>
        {bannerMode === "offline" ? "You are offline" : "Back online"}
      </Text>
      <Text style={styles.subtitleText}>
        {bannerMode === "offline"
          ? "Connection lost. Actions will retry once network is available."
          : "Connection restored. Live data sync resumed."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 10,
    right: 10,
    top: 0,
    zIndex: 2000,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  offlineContainer: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
  },
  onlineContainer: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
  },
  titleText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitleText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
});
