import { GameModeHero } from "../../../../v2018-archive/gamemode/types.ts";
import { getSumOfUnits } from "../../../components/common/roster/totalUnits.ts";
import { Roster, SelectedUnit } from "../../../types/roster.ts";
import { Slice } from "../../Slice.ts";
import { GameModeState } from "../index.ts";
import { createGameState } from "./create-game-state.ts";

export type Game = {
  heroes: Record<string, GameModeHero[]>;
  casualties: number;
  heroCasualties: number;
  started: number;
  lastUpdated: number;
};

export type GameMetaData = {
  heroes: Pick<
    SelectedUnit,
    "name" | "unit_type" | "quantity" | "profile_origin"
  >[];
  iGameState: Pick<Game, "heroes">;
  points: number;
  bows: number;
};

export type GameState = {
  gameMode: boolean;
  setGameMode: (gameMode: boolean) => void;
  gameState?: Game;
  gameMetaData?: GameMetaData;
  startNewGame: (roster: Roster) => void;
  restartGame: () => void;
  updateGameState: (update: Partial<Game>) => void;
  initializeGameState: () => void;
};

const initialState = {
  gameMode: false,
  gameState: null,
  gameMetaData: null,
};

export const gameStateSlice: Slice<GameModeState, GameState> = (set) => ({
  ...initialState,

  setGameMode: (gameMode) => set({ gameMode }, undefined, "SET_GAME_MODE"),
  startNewGame: (roster: Roster) =>
    set(
      () => {
        return {
          gameMode: true,
          gameState: {
            ...createGameState(roster),
            started: Date.now(),
            lastUpdated: Date.now(),
          },
          gameMetaData: {
            iGameState: createGameState(roster),
            factions: [
              ...new Set(
                roster.warbands
                  .flatMap((wb) => wb.hero?.army_list)
                  .filter((f) => !!f),
              ),
            ],
            bows: roster.metadata.bows,
            points: roster.metadata.points,
            heroes: getSumOfUnits(roster)
              .filter((unit) => unit.unit_type.includes("Hero"))
              .map((hero) => ({
                name: hero.name,
                quantity: hero.quantity,
                unit_type: hero.unit_type,
                profile_origin: hero.profile_origin,
              })),
          } as GameMetaData,
        };
      },
      undefined,
      "START_GAME",
    ),
  restartGame: () =>
    set(
      ({ gameMetaData: { iGameState } }) => {
        return {
          gameMode: true,
          gameState: {
            // Small hack to remove memory reference to original object.
            ...JSON.parse(JSON.stringify(iGameState)),
            started: Date.now(),
            lastUpdated: Date.now(),
          },
        };
      },
      undefined,
      "RESTART_GAME",
    ),
  updateGameState: (gameStateUpdate) =>
    set(
      ({ gameState }) => ({
        gameState: {
          ...gameState,
          ...gameStateUpdate,
          lastUpdated: Date.now(),
        },
      }),
      undefined,
      "UPDATE_GAME_STATE",
    ),

  initializeGameState: () =>
    set(
      () => ({
        ...initialState,
      }),
      undefined,
      "INITIALIZE_GAMESTATE",
    ),
});
