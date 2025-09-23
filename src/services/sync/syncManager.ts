import { getStorageAdapter } from "../storage/index.ts";
import { SyncStatus } from "../storage/types.ts";
import { SupabaseConfigManager } from "../config/supabaseConfig.ts";

/**
 * Sync manager that orchestrates synchronization between local stores and cloud storage
 */
export class SyncManager {
  private static instance: SyncManager | null = null;
  private syncInProgress = false;
  private lastSyncTime = 0;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  private constructor() {}

  static getInstance(): SyncManager {
    if (!this.instance) {
      this.instance = new SyncManager();
    }
    return this.instance;
  }

  /**
   * Subscribe to sync status changes
   */
  onStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of status change
   */
  private notifyStatusChange(status: SyncStatus): void {
    this.listeners.forEach((listener) => listener(status));
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    if (this.syncInProgress) {
      return "syncing";
    }

    try {
      const storage = await getStorageAdapter();
      const metadata = await storage.getSyncMetadata();
      return metadata.syncStatus;
    } catch {
      return "error";
    }
  }

  /**
   * Perform initial sync on app startup
   */
  async performInitialSync(): Promise<void> {
    if (this.syncInProgress) return;

    this.syncInProgress = true;
    this.notifyStatusChange("syncing");

    try {
      const storage = await getStorageAdapter();

      // Check if we're using hybrid storage (has cloud sync)
      const metadata = await storage.getSyncMetadata();

      if (metadata.syncStatus !== "offline") {
        // Perform initial data pull from cloud
        await Promise.all([
          storage.getRosters(),
          storage.getRosterGroups(),
          storage.getMatches(),
          storage.getCollection(),
        ]);

        this.lastSyncTime = Date.now();
        this.notifyStatusChange("idle");
      } else {
        this.notifyStatusChange("offline");
      }
    } catch (error) {
      console.warn("Initial sync failed:", error);
      this.notifyStatusChange("error");
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Force a full sync with cloud
   */
  async forceSync(): Promise<void> {
    if (this.syncInProgress) {
      throw new Error("Sync already in progress");
    }

    this.syncInProgress = true;
    this.notifyStatusChange("syncing");

    try {
      const storage = await getStorageAdapter();

      // If the adapter supports forcing a push to the cloud, do that first so the
      // subsequent pull reflects the latest local data.
      if (
        "forceSyncToCloud" in storage &&
        typeof (storage as any).forceSyncToCloud === "function"
      ) {
        await (storage as any).forceSyncToCloud();
      }

      // Force refresh data from cloud
      await Promise.all([
        storage.getRosters(),
        storage.getRosterGroups(),
        storage.getMatches(),
        storage.getCollection(),
      ]);

      this.lastSyncTime = Date.now();
      this.notifyStatusChange("idle");
    } catch (error) {
      console.error("Force sync failed:", error);
      this.notifyStatusChange("error");
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync roster data (called when roster operations happen)
   */
  async syncRoster(
    _rosterId: string,
    operation: "create" | "update" | "delete",
  ): Promise<void> {
    try {
      const storage = await getStorageAdapter();

      // The storage adapter handles the actual sync in background
      // This just ensures we have the latest data
      if (operation !== "delete") {
        await storage.getRosters();
      }
    } catch (error) {
      console.warn("Roster sync failed:", error);
    }
  }

  /**
   * Sync match data (called when match operations happen)
   */
  async syncMatch(
    _matchId: string,
    operation: "create" | "update" | "delete",
  ): Promise<void> {
    try {
      const storage = await getStorageAdapter();

      if (operation !== "delete") {
        await storage.getMatches();
      }
    } catch (error) {
      console.warn("Match sync failed:", error);
    }
  }

  /**
   * Sync collection data (called when collection operations happen)
   */
  async syncCollection(): Promise<void> {
    try {
      const storage = await getStorageAdapter();
      await storage.getCollection();
    } catch (error) {
      console.warn("Collection sync failed:", error);
    }
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): number {
    return this.lastSyncTime;
  }

  /**
   * Check if sync is available (i.e., cloud storage is configured)
   */
  async isSyncAvailable(): Promise<boolean> {
    // Check if Supabase is configured and enabled
    return SupabaseConfigManager.isConfigured();
  }
}
