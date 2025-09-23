import { useCallback } from "react";
import { useCollectionState } from "../state/collection/index.ts";
import { PastGame } from "../state/recent-games/history/index.ts";
import { useRecentGamesState } from "../state/recent-games/index.ts";
import { RosterGroup } from "../state/roster-building/groups/index.ts";
import { useRosterBuildingState } from "../state/roster-building/index.ts";
import { Roster } from "../types/roster.ts";
import { useSync } from "./useSync.ts";

/**
 * Enhanced roster building hook with sync integration
 */
export const useSyncedRosterBuilding = () => {
  const store = useRosterBuildingState();
  const { syncRoster } = useSync();

  const createRoster = useCallback(
    async (roster: Roster) => {
      // Create roster in local store first
      store.createRoster(roster);

      // Sync to cloud in background
      try {
        await syncRoster(roster.id, "create");
      } catch (error) {
        console.warn("Failed to sync new roster:", error);
        // Don't throw error - local operation succeeded
      }
    },
    [store, syncRoster],
  );

  const updateRoster = useCallback(
    async (roster: Roster, originalId?: string) => {
      // Update roster in local store first
      store.updateRoster(roster, originalId);

      // Sync to cloud in background
      try {
        await syncRoster(roster.id, "update");
      } catch (error) {
        console.warn("Failed to sync roster update:", error);
      }
    },
    [store, syncRoster],
  );

  const deleteRoster = useCallback(
    async (roster: Roster) => {
      // Delete roster from local store first
      store.deleteRoster(roster);

      // Sync to cloud in background
      try {
        await syncRoster(roster.id, "delete");
      } catch (error) {
        console.warn("Failed to sync roster deletion:", error);
      }
    },
    [store, syncRoster],
  );

  const createGroup = useCallback(
    async (group: Omit<RosterGroup, "id">) => {
      // Create group in local store first
      const groupId = store.createGroup(group);

      // Sync to cloud in background
      try {
        await syncRoster(groupId, "create"); // Groups sync with rosters
      } catch (error) {
        console.warn("Failed to sync new group:", error);
      }

      return groupId;
    },
    [store, syncRoster],
  );

  const updateGroup = useCallback(
    async (id: string, update: Partial<Omit<RosterGroup, "id">>) => {
      // Update group in local store first
      store.updateGroup(id, update);

      // Sync to cloud in background
      try {
        await syncRoster(id, "update");
      } catch (error) {
        console.warn("Failed to sync group update:", error);
      }
    },
    [store, syncRoster],
  );

  const disbandGroup = useCallback(
    async (id: string) => {
      // Disband group in local store first
      store.disbandGroup(id);

      // Sync to cloud in background
      try {
        await syncRoster(id, "delete");
      } catch (error) {
        console.warn("Failed to sync group disband:", error);
      }
    },
    [store, syncRoster],
  );

  const deleteGroup = useCallback(
    async (id: string) => {
      // Delete group in local store first
      store.deleteGroup(id);

      // Sync to cloud in background
      try {
        await syncRoster(id, "delete");
      } catch (error) {
        console.warn("Failed to sync group deletion:", error);
      }
    },
    [store, syncRoster],
  );

  return {
    // State
    rosters: store.rosters,
    groups: store.groups,

    // Synced actions
    createRoster,
    updateRoster,
    deleteRoster,
    createGroup,
    updateGroup,
    disbandGroup,
    deleteGroup,

    // Non-synced actions (UI state)
    armyList: store.armyList,
    selectionType: store.selectionType,
    selectionFocus: store.selectionFocus,
    updateBuilderSidebar: store.updateBuilderSidebar,
  };
};

/**
 * Enhanced recent games hook with sync integration
 */
export const useSyncedRecentGames = () => {
  const store = useRecentGamesState();
  const { syncMatch } = useSync();

  const addGame = useCallback(
    async (game: PastGame) => {
      // Add game to local store first
      store.addGame(game);

      // Sync to cloud in background
      try {
        await syncMatch(game.id, "create");
      } catch (error) {
        console.warn("Failed to sync new game:", error);
      }
    },
    [store, syncMatch],
  );

  const editGame = useCallback(
    async (game: PastGame) => {
      // Edit game in local store first
      store.editGame(game);

      // Sync to cloud in background
      try {
        await syncMatch(game.id, "update");
      } catch (error) {
        console.warn("Failed to sync game edit:", error);
      }
    },
    [store, syncMatch],
  );

  const deleteGame = useCallback(
    async (gameId: string) => {
      // Delete game from local store first
      store.deleteGame(gameId);

      // Sync to cloud in background
      try {
        await syncMatch(gameId, "delete");
      } catch (error) {
        console.warn("Failed to sync game deletion:", error);
      }
    },
    [store, syncMatch],
  );

  return {
    // State
    recentGames: store.recentGames,
    showHistory: store.showHistory,
    setShowHistory: store.setShowHistory,

    // Synced actions
    addGame,
    editGame,
    deleteGame,

    // Non-synced actions (imports handled separately)
    importGames: store.importGames,
  };
};

/**
 * Enhanced collection hook with sync integration
 */
export const useSyncedCollection = () => {
  const store = useCollectionState();
  const { syncCollection } = useSync();

  const upsertInventory = useCallback(
    async (group: string, name: string, inventory: any) => {
      // Update inventory in local store first
      store.upsertInventory(group, name, inventory);

      // Sync to cloud in background
      try {
        await syncCollection();
      } catch (error) {
        console.warn("Failed to sync inventory update:", error);
      }
    },
    [store, syncCollection],
  );

  const deleteEntry = useCallback(
    async (group: string, name: string) => {
      // Delete entry from local store first
      store.deleteEntry(group, name);

      // Sync to cloud in background
      try {
        await syncCollection();
      } catch (error) {
        console.warn("Failed to sync inventory deletion:", error);
      }
    },
    [store, syncCollection],
  );

  return {
    // State
    inventory: store.inventory,

    // Synced actions
    upsertInventory,
    deleteEntry,
  };
};
