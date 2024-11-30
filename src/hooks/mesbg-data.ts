// TODO: VERIFY FILE

export const useMesbgData = () => {
  // const { warriorSelectionFocus, roster, uniqueModels } =
  //   useRosterBuildingState();

  // const factionsGroupedByType: Record<ArmyType, Set<Faction>> = rawData.reduce(
  //   (a, { faction_type, faction }) => {
  //     if (!a[faction_type]) a[faction_type] = new Set();
  //     a[faction_type].add(faction);
  //     return a;
  //   },
  //   {
  //     "Good Army": undefined,
  //     "Evil Army": undefined,
  //     "Good LL": undefined,
  //     "Evil LL": undefined,
  //   } as Record<ArmyType, Set<Faction>>,
  // );

  // const getFactionsOfType = (type: ArmyType) => [];

  // const getHeroesFromFaction = (faction: Faction): Unit[] => {
  //   return rawData.filter(
  //     (data) =>
  //       data.faction === faction &&
  //       !["Independent Hero*", "Warrior"].includes(data.unit_type),
  //   ) as Unit[];
  // };
  //
  // const getHeroesRaw = (): Unit[] => {
  //   return rawData.filter(
  //     (data) => !["Independent Hero*", "Warrior"].includes(data.unit_type),
  //   ) as Unit[];
  // };
  //
  // function getEligibleWarbandUnitsForHero(
  //   warbandHero: Unit,
  //   checkUnique: boolean = true,
  // ) {
  //   const heroData = heroConstraintData[warbandHero.model_id];
  //   if (!heroData || !heroData[0]) return [];
  //   const validUnits = heroData[0]["valid_warband_units"];
  //
  //   return rawData.filter(
  //     (data) =>
  //       validUnits.includes(data.model_id) &&
  //       (!checkUnique ||
  //         !(data.unique && uniqueModels.includes(data.model_id))),
  //   ) as Unit[];
  // }
  //
  // const getEligibleWarbandUnits = (): Unit[] => {
  //   const [focusedWarband] = warriorSelectionFocus;
  //   const warbandHero: Unit | null = roster.warbands.find(
  //     ({ id }) => focusedWarband === id,
  //   )?.hero;
  //
  //   if (!isDefinedUnit(warbandHero)) return [];
  //   return getEligibleWarbandUnitsForHero(warbandHero);
  // };

  return {
    factionsGroupedByType: {},
    // getHeroesFromFaction,
    // getHeroesRaw,
    // getEligibleWarbandUnits,
    // getEligibleWarbandUnitsForHero,
  };
};
