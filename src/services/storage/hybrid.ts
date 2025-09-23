import { PastGame } from "../../state/recent-games/history/index.ts";
import { RosterGroup } from "../../state/roster-building/groups/index.ts";
import { Roster } from "../../types/roster.ts";
import { LocalStorageAdapter } from "./localStorage.ts";
import { SupabaseAdapter } from "./supabase.ts";
import { StorageAdapter, SyncMetadata, Inventory } from "./types.ts";

/**
 * Hybrid storage adapter that combines local storage with cloud sync
 * - Prioritizes local operations for speed
 * - Syncs to cloud in the background
 * - Falls back to local storage if cloud fails
 */
export class HybridAdapter implements StorageAdapter {
  private syncQueue: Array<() => Promise<void>> = [];
  private syncInProgress = false;

  constructor(
    private localAdapter: LocalStorageAdapter,
    private cloudAdapter: SupabaseAdapter,
  ) {}

  // Roster management
  async getRosters(): Promise<Roster[]> {
    try {
      // Always try cloud first to get latest data
      const cloudRosters = await this.cloudAdapter.getRosters();

      // Update local storage with cloud data
      const localRosters = await this.localAdapter.getRosters();

      // Simple merge strategy: prefer cloud data for existing rosters
      const mergedRosters = this.mergeRosters(localRosters, cloudRosters);

      // Update local storage
      for (const roster of cloudRosters) {
        await this.localAdapter.updateRoster(roster);
      }

      return mergedRosters;
    } catch (error) {
      console.warn("Cloud sync failed for rosters, using local data:", error);
      return this.localAdapter.getRosters();
    }
  }

  async saveRoster(roster: Roster): Promise<void> {
    // Always save locally first for immediate feedback
    await this.localAdapter.saveRoster(roster);

    // Queue cloud sync
    this.queueCloudOperation(() => this.cloudAdapter.saveRoster(roster));
  }

  async updateRoster(roster: Roster): Promise<void> {
    // Always update locally first
    await this.localAdapter.updateRoster(roster);

    // Queue cloud sync
    this.queueCloudOperation(() => this.cloudAdapter.updateRoster(roster));
  }

  async deleteRoster(id: string): Promise<void> {
    // Always delete locally first
    await this.localAdapter.deleteRoster(id);

    // Queue cloud sync
    this.queueCloudOperation(() => this.cloudAdapter.deleteRoster(id));
  }

  // Roster groups management
  async getRosterGroups(): Promise<RosterGroup[]> {
    try {
      // Try cloud first
      const cloudGroups = await this.cloudAdapter.getRosterGroups();

      // Update local storage with cloud data
      for (const group of cloudGroups) {
        await this.localAdapter.updateRosterGroup(group);
      }

      return cloudGroups;
    } catch (error) {
      console.warn(
        "Cloud sync failed for roster groups, using local data:",
        error,
      );
      return this.localAdapter.getRosterGroups();
    }
  }

  async saveRosterGroup(group: RosterGroup): Promise<void> {
    await this.localAdapter.saveRosterGroup(group);
    this.queueCloudOperation(() => this.cloudAdapter.saveRosterGroup(group));
  }

  async updateRosterGroup(group: RosterGroup): Promise<void> {
    await this.localAdapter.updateRosterGroup(group);
    this.queueCloudOperation(() => this.cloudAdapter.updateRosterGroup(group));
  }

  async deleteRosterGroup(id: string): Promise<void> {
    await this.localAdapter.deleteRosterGroup(id);
    this.queueCloudOperation(() => this.cloudAdapter.deleteRosterGroup(id));
  }

  // Match history management
  async getMatches(): Promise<PastGame[]> {
    try {
      // Try cloud first
      const cloudMatches = await this.cloudAdapter.getMatches();
      const localMatches = await this.localAdapter.getMatches();

      // Merge matches by ID, preferring cloud data
      const mergedMatches = this.mergeMatches(localMatches, cloudMatches);

      // Update local storage
      for (const match of cloudMatches) {
        await this.localAdapter.updateMatch(match);
      }

      return mergedMatches;
    } catch (error) {
      console.warn("Cloud sync failed for matches, using local data:", error);
      return this.localAdapter.getMatches();
    }
  }

  async saveMatch(match: PastGame): Promise<void> {
    await this.localAdapter.saveMatch(match);
    this.queueCloudOperation(() => this.cloudAdapter.saveMatch(match));
  }

  async updateMatch(match: PastGame): Promise<void> {
    await this.localAdapter.updateMatch(match);
    this.queueCloudOperation(() => this.cloudAdapter.updateMatch(match));
  }

  async deleteMatch(id: string): Promise<void> {
    await this.localAdapter.deleteMatch(id);
    this.queueCloudOperation(() => this.cloudAdapter.deleteMatch(id));
  }

  // Collection management
  async getCollection(): Promise<Inventory> {
    try {
      // Try cloud first
      const cloudCollection = await this.cloudAdapter.getCollection();

      // Update local storage
      await this.localAdapter.updateCollection(cloudCollection);

      return cloudCollection;
    } catch (error) {
      console.warn(
        "Cloud sync failed for collection, using local data:",
        error,
      );
      return this.localAdapter.getCollection();
    }
  }

  async updateCollection(inventory: Inventory): Promise<void> {
    await this.localAdapter.updateCollection(inventory);
    this.queueCloudOperation(() =>
      this.cloudAdapter.updateCollection(inventory),
    );
  }

  // Connection and sync status
  async isConnected(): Promise<boolean> {
    try {
      const cloudConnected = await this.cloudAdapter.isConnected();
      return cloudConnected;
    } catch {
      return false;
    }
  }

  async getSyncMetadata(): Promise<SyncMetadata> {
    try {
      const isConnected = await this.isConnected();
      const hasQueuedOperations = this.syncQueue.length > 0;

      return {
        lastModified: Date.now(),
        syncStatus: this.syncInProgress
          ? "syncing"
          : hasQueuedOperations
            ? "syncing"
            : isConnected
              ? "idle"
              : "offline",
      };
    } catch (error) {
      return {
        lastModified: Date.now(),
        syncStatus: "error",
        syncError: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Force sync all local data to cloud
   */
  async forceSyncToCloud(): Promise<void> {
    try {
      // Get all local data
      const [rosters, groups, matches, collection] = await Promise.all([
        this.localAdapter.getRosters(),
        this.localAdapter.getRosterGroups(),
        this.localAdapter.getMatches(),
        this.localAdapter.getCollection(),
      ]);

      // Sync to cloud
      await Promise.all([
        ...rosters.map((roster) => this.cloudAdapter.updateRoster(roster)),
        ...groups.map((group) => this.cloudAdapter.updateRosterGroup(group)),
        ...matches.map((match) => this.cloudAdapter.updateMatch(match)),
        this.cloudAdapter.updateCollection(collection),
      ]);

      console.log("Successfully synced all local data to cloud");
    } catch (error) {
      console.error("Failed to sync local data to cloud:", error);
      throw error;
    }
  }

  /**
   * Force sync all cloud data to local
   */
  async forceSyncFromCloud(): Promise<void> {
    try {
      // Get all cloud data
      const [rosters, groups, matches, collection] = await Promise.all([
        this.cloudAdapter.getRosters(),
        this.cloudAdapter.getRosterGroups(),
        this.cloudAdapter.getMatches(),
        this.cloudAdapter.getCollection(),
      ]);

      // Sync to local
      for (const roster of rosters) {
        await this.localAdapter.updateRoster(roster);
      }
      for (const group of groups) {
        await this.localAdapter.updateRosterGroup(group);
      }
      for (const match of matches) {
        await this.localAdapter.updateMatch(match);
      }
      await this.localAdapter.updateCollection(collection);

      console.log("Successfully synced all cloud data to local");
    } catch (error) {
      console.error("Failed to sync cloud data to local:", error);
      throw error;
    }
  }

  /**
   * Process the sync queue
   */
  private async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;

    try {
      // Process all queued operations
      while (this.syncQueue.length > 0) {
        const operation = this.syncQueue.shift();
        if (operation) {
          try {
            await operation();
          } catch (error) {
            console.warn("Cloud sync operation failed:", error);
            // Continue processing other operations
          }
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Queue a cloud operation for background sync
   */
  private queueCloudOperation(operation: () => Promise<void>): void {
    this.syncQueue.push(operation);

    // Process queue with a small delay to batch operations
    setTimeout(() => this.processSyncQueue(), 100);
  }

  /**
   * Merge rosters with conflict resolution (cloud wins)
   */
  private mergeRosters(local: Roster[], cloud: Roster[]): Roster[] {
    const cloudIds = new Set(cloud.map((r) => r.id));
    const localOnly = local.filter((r) => !cloudIds.has(r.id));

    return [...cloud, ...localOnly];
  }

  /**
   * Merge matches with conflict resolution (cloud wins)
   */
  private mergeMatches(local: PastGame[], cloud: PastGame[]): PastGame[] {
    const cloudIds = new Set(cloud.map((m) => m.id));
    const localOnly = local.filter((m) => !cloudIds.has(m.id));

    return [...cloud, ...localOnly];
  }
}
