import { PastGame } from "../../state/recent-games/history/index.ts";
import { RosterGroup } from "../../state/roster-building/groups/index.ts";
import { Roster } from "../../types/roster.ts";
import {
  StorageAdapter,
  SyncMetadata,
  Inventory,
  SupabaseConfig,
} from "./types.ts";
import { v5 as uuidv5, validate as validateUuid } from "uuid";

/**
 * Supabase storage adapter for cloud sync functionality
 */
export class SupabaseAdapter implements StorageAdapter {
  private supabase: any = null;
  private userId: string | null = null;
  // Namespace used to derive stable UUIDs from legacy string identifiers
  private static readonly LEGACY_ID_NAMESPACE =
    "eb5b4976-0e2d-5dd9-93bf-5d4bd9ce9a88";

  constructor(private config: SupabaseConfig) {}

  /**
   * Initialize Supabase client and authenticate if needed
   */
  private async initializeClient() {
    if (!this.supabase) {
      const { createClient } = await import("@supabase/supabase-js");
      this.supabase = createClient(this.config.url, this.config.anonKey);

      // Get current user
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      this.userId = user?.id || null;
    }
  }

  /**
   * Ensure user is authenticated
   */
  private async ensureAuthenticated(): Promise<string> {
    await this.initializeClient();

    if (!this.userId) {
      throw new Error("User not authenticated. Please sign in to sync data.");
    }

    return this.userId;
  }

  // Roster management
  async getRosters(): Promise<Roster[]> {
    const userId = await this.ensureAuthenticated();

    const { data, error } = await this.supabase
      .from("rosters")
      .select("data")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch rosters from Supabase:", error);
      throw new Error("Could not fetch rosters");
    }

    return data?.map((row: any) => row.data) || [];
  }

  async saveRoster(roster: Roster): Promise<void> {
    const userId = await this.ensureAuthenticated();
    const timestamp = new Date().toISOString();
    const primaryKey = this.normalizeId(roster.id, userId);

    // Upsert so first-time syncs create the row while subsequent saves update it
    const { error } = await this.supabase.from("rosters").upsert(
      {
        id: primaryKey,
        user_id: userId,
        data: roster,
        updated_at: timestamp,
      },
      { onConflict: "id" },
    );

    if (error) {
      console.error("Failed to save roster to Supabase:", error);
      throw new Error("Could not save roster");
    }
  }

  async updateRoster(roster: Roster): Promise<void> {
    const userId = await this.ensureAuthenticated();
    const timestamp = new Date().toISOString();
    const primaryKey = this.normalizeId(roster.id, userId);

    // Upsert covers the case where the roster was created offline/local only
    const { error } = await this.supabase.from("rosters").upsert(
      {
        id: primaryKey,
        user_id: userId,
        data: roster,
        updated_at: timestamp,
      },
      { onConflict: "id" },
    );

    if (error) {
      console.error("Failed to update roster in Supabase:", error);
      throw new Error("Could not update roster");
    }
  }

  async deleteRoster(id: string): Promise<void> {
    const userId = await this.ensureAuthenticated();
    const primaryKey = this.normalizeId(id, userId);

    const { error } = await this.supabase
      .from("rosters")
      .delete()
      .eq("id", primaryKey)
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to delete roster from Supabase:", error);
      throw new Error("Could not delete roster");
    }
  }

  // Roster groups management (stored with rosters for simplicity)
  async getRosterGroups(): Promise<RosterGroup[]> {
    const userId = await this.ensureAuthenticated();

    const { data, error } = await this.supabase
      .from("roster_groups")
      .select("data")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch roster groups from Supabase:", error);
      throw new Error("Could not fetch roster groups");
    }

    return data?.map((row: any) => row.data) || [];
  }

  async saveRosterGroup(group: RosterGroup): Promise<void> {
    const userId = await this.ensureAuthenticated();
    const timestamp = new Date().toISOString();
    const primaryKey = this.normalizeId(group.id, userId);

    // Upsert keeps group membership in sync whether or not the row exists yet
    const { error } = await this.supabase.from("roster_groups").upsert(
      {
        id: primaryKey,
        user_id: userId,
        data: group,
        updated_at: timestamp,
      },
      { onConflict: "id" },
    );

    if (error) {
      console.error("Failed to save roster group to Supabase:", error);
      throw new Error("Could not save roster group");
    }
  }

  async updateRosterGroup(group: RosterGroup): Promise<void> {
    const userId = await this.ensureAuthenticated();
    const timestamp = new Date().toISOString();
    const primaryKey = this.normalizeId(group.id, userId);

    // Upsert covers the case where the group originated locally before cloud sync
    const { error } = await this.supabase.from("roster_groups").upsert(
      {
        id: primaryKey,
        user_id: userId,
        data: group,
        updated_at: timestamp,
      },
      { onConflict: "id" },
    );

    if (error) {
      console.error("Failed to update roster group in Supabase:", error);
      throw new Error("Could not update roster group");
    }
  }

  async deleteRosterGroup(id: string): Promise<void> {
    const userId = await this.ensureAuthenticated();
    const primaryKey = this.normalizeId(id, userId);

    const { error } = await this.supabase
      .from("roster_groups")
      .delete()
      .eq("id", primaryKey)
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to delete roster group from Supabase:", error);
      throw new Error("Could not delete roster group");
    }
  }

  // Match history management
  async getMatches(): Promise<PastGame[]> {
    const userId = await this.ensureAuthenticated();

    const { data, error } = await this.supabase
      .from("matches")
      .select("data")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch matches from Supabase:", error);
      throw new Error("Could not fetch matches");
    }

    return data?.map((row: any) => row.data) || [];
  }

  async saveMatch(match: PastGame): Promise<void> {
    const userId = await this.ensureAuthenticated();
    const timestamp = new Date().toISOString();
    const primaryKey = this.normalizeId(match.id, userId);

    // Upsert ensures historic matches aren't dropped during their first sync
    const { error } = await this.supabase.from("matches").upsert(
      {
        id: primaryKey,
        user_id: userId,
        data: match,
        updated_at: timestamp,
      },
      { onConflict: "id" },
    );

    if (error) {
      console.error("Failed to save match to Supabase:", error);
      throw new Error("Could not save match");
    }
  }

  async updateMatch(match: PastGame): Promise<void> {
    const userId = await this.ensureAuthenticated();
    const timestamp = new Date().toISOString();
    const primaryKey = this.normalizeId(match.id, userId);

    // Upsert covers the case where the match was recorded before cloud sync existed
    const { error } = await this.supabase.from("matches").upsert(
      {
        id: primaryKey,
        user_id: userId,
        data: match,
        updated_at: timestamp,
      },
      { onConflict: "id" },
    );

    if (error) {
      console.error("Failed to update match in Supabase:", error);
      throw new Error("Could not update match");
    }
  }

  async deleteMatch(id: string): Promise<void> {
    const userId = await this.ensureAuthenticated();
    const primaryKey = this.normalizeId(id, userId);

    const { error } = await this.supabase
      .from("matches")
      .delete()
      .eq("id", primaryKey)
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to delete match from Supabase:", error);
      throw new Error("Could not delete match");
    }
  }

  // Collection management
  async getCollection(): Promise<Inventory> {
    const userId = await this.ensureAuthenticated();

    const { data, error } = await this.supabase
      .from("collections")
      .select("data")
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to fetch collection from Supabase:", error);
      throw new Error("Could not fetch collection");
    }

    // Return empty inventory if no collection exists, otherwise return the first (and only) record
    return data && data.length > 0 ? data[0].data : {};
  }

  async updateCollection(inventory: Inventory): Promise<void> {
    const userId = await this.ensureAuthenticated();

    const { error } = await this.supabase.from("collections").upsert({
      user_id: userId,
      data: inventory,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to update collection in Supabase:", error);
      throw new Error("Could not update collection");
    }
  }

  // Connection and sync status
  async isConnected(): Promise<boolean> {
    try {
      await this.initializeClient();

      // Test connection by making a simple query
      const { error } = await this.supabase
        .from("rosters")
        .select("id")
        .limit(1);

      return !error;
    } catch (error) {
      console.warn("Supabase connection test failed:", error);
      return false;
    }
  }

  async getSyncMetadata(): Promise<SyncMetadata> {
    try {
      const isConnected = await this.isConnected();

      return {
        lastModified: Date.now(),
        syncStatus: isConnected ? "idle" : "offline",
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
   * Authentication methods
   */

  private normalizeId(id: string, userId: string): string {
    if (validateUuid(id)) {
      return id;
    }

    return uuidv5(`${userId}:${id}`, SupabaseAdapter.LEGACY_ID_NAMESPACE);
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string): Promise<void> {
    await this.initializeClient();

    const { error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<void> {
    await this.initializeClient();

    const { error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Update userId after successful sign in
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    this.userId = user?.id || null;
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithProvider(provider: "google" | "github"): Promise<void> {
    await this.initializeClient();

    const { error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    await this.initializeClient();

    const { error } = await this.supabase.auth.signOut();
    this.userId = null;

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<any> {
    await this.initializeClient();

    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    return user;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.initializeClient();
      const user = await this.getCurrentUser();
      return !!user;
    } catch {
      return false;
    }
  }
}
