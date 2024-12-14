import { GameModeHero } from "../../../../v2018-archive/gamemode/types.ts";
import {
  FreshUnit,
  isSelectedUnit,
  Roster,
  SelectedUnit,
} from "../../../types/roster.ts";

const convertToStats = (
  name: string | number,
  MWFW: string,
  unit: SelectedUnit,
  isArmyLeader: boolean,
): GameModeHero => ({
  name: String(name),
  MWFW: MWFW,
  xMWFW: MWFW,
  profile_origin: unit.profile_origin,
  leader: isArmyLeader,
});

const mapHeroToStats = (
  unit: SelectedUnit | FreshUnit,
  isArmyLeader?: boolean,
): Record<string, GameModeHero[]> => {
  // check if a unit is selected (and not an empty selector box)
  if (!isSelectedUnit(unit)) return null;

  // check if unit is a hero
  if (unit.MWFW.length === 0) return null;
  // check if unit is composed of multiple hero's (such as Alladan & Elrohir)
  if (unit.MWFW.length > 1) {
    return {
      [unit.id]: unit.MWFW.map(([name, MWFW]) =>
        convertToStats(name, MWFW, unit, isArmyLeader),
      ),
    };
  } else {
    const [[name, MWFW]] = unit.MWFW;
    return {
      [unit.id]: [convertToStats(name || unit.name, MWFW, unit, isArmyLeader)],
    };
  }
};

const getHeroes = (roster: Roster): Record<string, GameModeHero[]> => {
  return roster.warbands
    .map(({ hero, units, id }) => [
      mapHeroToStats(hero, roster.metadata.leader === id),
      ...units.map((unit) => mapHeroToStats(unit)).filter((v) => !!v),
    ])
    .flat()
    .reduce((result, hero) => ({ ...result, ...hero }), {});
};

export const createGameState = (
  roster: Roster,
): {
  heroes: Record<string, GameModeHero[]>;
  casualties: number;
  heroCasualties: number;
} => ({
  heroes: getHeroes(roster),
  casualties: 0,
  heroCasualties: 0,
});
