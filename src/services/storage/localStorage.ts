import { PastGame } from "../../state/recent-games/history/index.ts";
import { RosterGroup } from "../../state/roster-building/groups/index.ts";
import { Roster } from "../../types/roster.ts";
import { StorageAdapter, SyncMetadata, Inventory } from "./types.ts";

/**
 * LocalStorage adapter that maintains compatibility with existing localStorage-based persistence
 */
export class LocalStorageAdapter implements StorageAdapter {
  private readonly STORAGE_KEYS = {
    rosters: "mlb-rosters",
    matches: "mlb-matches",
    collection: "mlb-collection",
    preferences: "mlb-preferences", // Not synced but kept for reference
  };

  // Roster management
  async getRosters(): Promise<Roster[]> {
    const data = this.getFromStorage(this.STORAGE_KEYS.rosters);
    return data?.state?.rosters || [];
  }

  async saveRoster(roster: Roster): Promise<void> {
    const data = this.getFromStorage(this.STORAGE_KEYS.rosters);
    const rosters = data?.state?.rosters || [];
    const groups = data?.state?.groups || [];

    const updatedRosters = [...rosters, roster];

    // Update groups if roster belongs to one
    const updatedGroups = groups.map((group: RosterGroup) =>
      roster.group && roster.group === group.id
        ? { ...group, rosters: [...group.rosters, roster.id] }
        : group,
    );

    this.saveToStorage(this.STORAGE_KEYS.rosters, {
      ...data,
      state: {
        ...data?.state,
        rosters: updatedRosters,
        groups: updatedGroups,
      },
    });
  }

  async updateRoster(roster: Roster): Promise<void> {
    const data = this.getFromStorage(this.STORAGE_KEYS.rosters);
    const rosters = data?.state?.rosters || [];

    const updatedRosters = rosters.map((r: Roster) =>
      r.id === roster.id ? roster : r,
    );

    this.saveToStorage(this.STORAGE_KEYS.rosters, {
      ...data,
      state: {
        ...data?.state,
        rosters: updatedRosters,
      },
    });
  }

  async deleteRoster(id: string): Promise<void> {
    const data = this.getFromStorage(this.STORAGE_KEYS.rosters);
    const rosters = data?.state?.rosters || [];
    const groups = data?.state?.groups || [];

    const rosterToDelete = rosters.find((r: Roster) => r.id === id);
    const updatedRosters = rosters.filter((r: Roster) => r.id !== id);

    // Update groups to remove roster reference
    const updatedGroups = groups.map((group: RosterGroup) =>
      rosterToDelete?.group && rosterToDelete.group === group.id
        ? {
            ...group,
            rosters: group.rosters.filter(
              (rosterId: string) => rosterId !== id,
            ),
          }
        : group,
    );

    this.saveToStorage(this.STORAGE_KEYS.rosters, {
      ...data,
      state: {
        ...data?.state,
        rosters: updatedRosters,
        groups: updatedGroups,
      },
    });
  }

  // Roster groups management
  async getRosterGroups(): Promise<RosterGroup[]> {
    const data = this.getFromStorage(this.STORAGE_KEYS.rosters);
    return data?.state?.groups || [];
  }

  async saveRosterGroup(group: RosterGroup): Promise<void> {
    const data = this.getFromStorage(this.STORAGE_KEYS.rosters);
    const groups = data?.state?.groups || [];
    const rosters = data?.state?.rosters || [];

    const updatedGroups = [...groups, group];

    // Update rosters that belong to this group
    const updatedRosters = rosters.map((roster: Roster) =>
      group.rosters.includes(roster.id)
        ? { ...roster, group: group.id }
        : roster,
    );

    this.saveToStorage(this.STORAGE_KEYS.rosters, {
      ...data,
      state: {
        ...data?.state,
        groups: updatedGroups,
        rosters: updatedRosters,
      },
    });
  }

  async updateRosterGroup(group: RosterGroup): Promise<void> {
    const data = this.getFromStorage(this.STORAGE_KEYS.rosters);
    const groups = data?.state?.groups || [];

    const updatedGroups = groups.map((g: RosterGroup) =>
      g.id === group.id ? group : g,
    );

    this.saveToStorage(this.STORAGE_KEYS.rosters, {
      ...data,
      state: {
        ...data?.state,
        groups: updatedGroups,
      },
    });
  }

  async deleteRosterGroup(id: string): Promise<void> {
    const data = this.getFromStorage(this.STORAGE_KEYS.rosters);
    const groups = data?.state?.groups || [];
    const rosters = data?.state?.rosters || [];

    const updatedGroups = groups.filter((g: RosterGroup) => g.id !== id);

    // Remove group reference from rosters (disband, don't delete rosters)
    const updatedRosters = rosters.map((roster: Roster) =>
      roster.group === id ? { ...roster, group: undefined } : roster,
    );

    this.saveToStorage(this.STORAGE_KEYS.rosters, {
      ...data,
      state: {
        ...data?.state,
        groups: updatedGroups,
        rosters: updatedRosters,
      },
    });
  }

  // Match history management
  async getMatches(): Promise<PastGame[]> {
    const data = this.getFromStorage(this.STORAGE_KEYS.matches);
    return data?.state?.recentGames || [];
  }

  async saveMatch(match: PastGame): Promise<void> {
    const data = this.getFromStorage(this.STORAGE_KEYS.matches);
    const matches = data?.state?.recentGames || [];

    const updatedMatches = [...matches, match];

    this.saveToStorage(this.STORAGE_KEYS.matches, {
      ...data,
      state: {
        ...data?.state,
        recentGames: updatedMatches,
      },
    });
  }

  async updateMatch(match: PastGame): Promise<void> {
    const data = this.getFromStorage(this.STORAGE_KEYS.matches);
    const matches = data?.state?.recentGames || [];

    const updatedMatches = matches.map((m: PastGame) =>
      m.id === match.id ? match : m,
    );

    this.saveToStorage(this.STORAGE_KEYS.matches, {
      ...data,
      state: {
        ...data?.state,
        recentGames: updatedMatches,
      },
    });
  }

  async deleteMatch(id: string): Promise<void> {
    const data = this.getFromStorage(this.STORAGE_KEYS.matches);
    const matches = data?.state?.recentGames || [];

    const updatedMatches = matches.filter((m: PastGame) => m.id !== id);

    this.saveToStorage(this.STORAGE_KEYS.matches, {
      ...data,
      state: {
        ...data?.state,
        recentGames: updatedMatches,
      },
    });
  }

  // Collection management
  async getCollection(): Promise<Inventory> {
    const data = this.getFromStorage(this.STORAGE_KEYS.collection);
    return data?.state?.inventory || {};
  }

  async updateCollection(inventory: Inventory): Promise<void> {
    const data = this.getFromStorage(this.STORAGE_KEYS.collection);

    this.saveToStorage(this.STORAGE_KEYS.collection, {
      ...data,
      state: {
        ...data?.state,
        inventory,
      },
    });
  }

  // Connection and sync status
  async isConnected(): Promise<boolean> {
    // LocalStorage is always "connected"
    return true;
  }

  async getSyncMetadata(): Promise<SyncMetadata> {
    return {
      lastModified: Date.now(),
      syncStatus: "idle",
    };
  }

  // Private helper methods
  private getFromStorage(key: string): any {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn(`Failed to get data from localStorage key "${key}":`, error);
      return null;
    }
  }

  private saveToStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));

      // Trigger storage event for cross-tab sync (existing behavior)
      window.dispatchEvent(
        new StorageEvent("storage", {
          key,
          newValue: JSON.stringify(data),
          storageArea: localStorage,
        }),
      );
    } catch (error) {
      console.error(`Failed to save data to localStorage key "${key}":`, error);
    }
  }
}
