import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useCallback, useEffect, useMemo, useState } from "react";

type OnlineResolution = {
  isOnline: boolean;
  isOffline: boolean;
  hasConnectionSignal: boolean;
};

export type NetworkStatusSnapshot = {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  hasConnectionSignal: boolean;
  isOnline: boolean;
  isOffline: boolean;
  lastChangeAt: number;
};

export type UseNetworkStatusResult = NetworkStatusSnapshot & {
  refreshNetworkState: () => Promise<void>;
};

function resolveOnlineStatus(
  isConnected: boolean | null,
  isInternetReachable: boolean | null,
): OnlineResolution {
  if (isConnected === false || isInternetReachable === false) {
    return {
      isOnline: false,
      isOffline: true,
      hasConnectionSignal: false,
    };
  }

  if (isConnected === true && isInternetReachable === true) {
    return {
      isOnline: true,
      isOffline: false,
      hasConnectionSignal: true,
    };
  }

  // Conservative web strategy: unknown network state is treated as online
  // to avoid false offline flicker during browser reachability transitions.
  return {
    isOnline: true,
    isOffline: false,
    hasConnectionSignal: true,
  };
}

function mapStateToSnapshot(state: NetInfoState): NetworkStatusSnapshot {
  const isConnected = state.isConnected ?? null;
  const isInternetReachable = state.isInternetReachable ?? null;
  const resolved = resolveOnlineStatus(isConnected, isInternetReachable);

  return {
    isConnected,
    isInternetReachable,
    hasConnectionSignal: resolved.hasConnectionSignal,
    isOnline: resolved.isOnline,
    isOffline: resolved.isOffline,
    lastChangeAt: Date.now(),
  };
}

const INITIAL_SNAPSHOT: NetworkStatusSnapshot = {
  isConnected: null,
  isInternetReachable: null,
  hasConnectionSignal: true,
  isOnline: true,
  isOffline: false,
  lastChangeAt: Date.now(),
};

export function useNetworkStatus(): UseNetworkStatusResult {
  const [snapshot, setSnapshot] =
    useState<NetworkStatusSnapshot>(INITIAL_SNAPSHOT);

  const applyState = useCallback((state: NetInfoState) => {
    setSnapshot(mapStateToSnapshot(state));
  }, []);

  const refreshNetworkState = useCallback(async () => {
    const latestState = await NetInfo.fetch();
    applyState(latestState);
  }, [applyState]);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!isMounted) {
        return;
      }
      applyState(state);
    });

    void NetInfo.fetch().then((state) => {
      if (isMounted) {
        applyState(state);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [applyState]);

  return useMemo(
    () => ({
      ...snapshot,
      refreshNetworkState,
    }),
    [snapshot, refreshNetworkState],
  );
}
