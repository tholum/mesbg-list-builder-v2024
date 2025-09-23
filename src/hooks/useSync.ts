import { useState, useEffect, useCallback } from "react";
import { SyncStatus } from "../services/storage/types.ts";
import { SyncManager } from "../services/sync/syncManager.ts";

/**
 * Hook to manage sync status and operations
 */
export const useSync = () => {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);

  const syncManager = SyncManager.getInstance();

  useEffect(() => {
    // Initialize sync status
    const initializeSync = async () => {
      const currentStatus = await syncManager.getSyncStatus();
      setStatus(currentStatus);

      const available = await syncManager.isSyncAvailable();
      setIsAvailable(available);

      const lastSync = syncManager.getLastSyncTime();
      setLastSyncTime(lastSync);

      // Perform initial sync if available
      if (available) {
        await syncManager.performInitialSync();
      }
    };

    initializeSync();

    // Subscribe to status changes
    const unsubscribe = syncManager.onStatusChange(setStatus);

    return unsubscribe;
  }, [syncManager]);

  const forceSync = useCallback(async () => {
    try {
      await syncManager.forceSync();
      setLastSyncTime(Date.now());
    } catch (error) {
      console.error("Force sync failed:", error);
      throw error;
    }
  }, [syncManager]);

  const syncRoster = useCallback(
    async (rosterId: string, operation: "create" | "update" | "delete") => {
      await syncManager.syncRoster(rosterId, operation);
    },
    [syncManager],
  );

  const syncMatch = useCallback(
    async (matchId: string, operation: "create" | "update" | "delete") => {
      await syncManager.syncMatch(matchId, operation);
    },
    [syncManager],
  );

  const syncCollection = useCallback(async () => {
    await syncManager.syncCollection();
  }, [syncManager]);

  return {
    // Status
    status,
    lastSyncTime,
    isAvailable,

    // Actions
    forceSync,
    syncRoster,
    syncMatch,
    syncCollection,

    // Computed
    isSyncing: status === "syncing",
    hasError: status === "error",
    isOffline: status === "offline",
    isIdle: status === "idle",
  };
};

/**
 * Hook specifically for sync status display in UI
 */
export const useSyncStatus = () => {
  const { status, lastSyncTime, isAvailable } = useSync();

  const getStatusText = () => {
    if (!isAvailable) return "Sync not configured";

    switch (status) {
      case "syncing":
        return "Syncing...";
      case "idle":
        return lastSyncTime ? "Synced" : "Ready to sync";
      case "offline":
        return "Offline";
      case "error":
        return "Sync error";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = ():
    | "success"
    | "warning"
    | "error"
    | "info"
    | "default" => {
    if (!isAvailable) return "default";

    switch (status) {
      case "syncing":
        return "info";
      case "idle":
        return "success";
      case "offline":
        return "warning";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  return {
    status,
    statusText: getStatusText(),
    statusColor: getStatusColor(),
    lastSyncTime,
    isAvailable,
    isSyncing: status === "syncing",
  };
};
