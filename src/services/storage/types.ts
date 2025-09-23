import { PastGame } from "../../state/recent-games/history/index.ts";
import { RosterGroup } from "../../state/roster-building/groups/index.ts";
import { Roster } from "../../types/roster.ts";

export type Inventory = Record<string, Record<string, { collection: any[] }>>;

export type SyncStatus = "idle" | "syncing" | "error" | "offline";

export type SyncMetadata = {
  lastModified: number;
  syncStatus: SyncStatus;
  syncError?: string;
};

/**
 * Storage adapter interface that can be implemented by different storage backends
 * (localStorage, Supabase, etc.)
 */
export interface StorageAdapter {
  // Roster management
  getRosters(): Promise<Roster[]>;
  saveRoster(roster: Roster): Promise<void>;
  updateRoster(roster: Roster): Promise<void>;
  deleteRoster(id: string): Promise<void>;

  // Roster groups management
  getRosterGroups(): Promise<RosterGroup[]>;
  saveRosterGroup(group: RosterGroup): Promise<void>;
  updateRosterGroup(group: RosterGroup): Promise<void>;
  deleteRosterGroup(id: string): Promise<void>;

  // Match history management
  getMatches(): Promise<PastGame[]>;
  saveMatch(match: PastGame): Promise<void>;
  updateMatch(match: PastGame): Promise<void>;
  deleteMatch(id: string): Promise<void>;

  // Collection management
  getCollection(): Promise<Inventory>;
  updateCollection(inventory: Inventory): Promise<void>;

  // Connection and sync status
  isConnected(): Promise<boolean>;
  getSyncMetadata(): Promise<SyncMetadata>;
}

/**
 * Supabase configuration provided by the user
 */
export type SupabaseConfig = {
  url: string;
  anonKey: string;
  enabled: boolean;
  lastValidated: number;
};

/**
 * QR code data format for sharing configurations
 */
export type ConfigQRData = {
  app: string;
  version: string;
  url: string;
  anonKey: string;
  session?: string; // Optional auth session
};
