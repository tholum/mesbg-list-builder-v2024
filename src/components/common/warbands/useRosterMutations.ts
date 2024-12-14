import { useParams } from "react-router-dom";
import { v4 as randomUuid } from "uuid";
import { useAppState } from "../../../state/app";
import { useRosterBuildingState } from "../../../state/roster-building";
import { emptyWarband } from "../../../state/roster-building/roster";
import { Roster } from "../../../types/roster.ts";
import { DrawerTypes } from "../../drawer/drawers.tsx";

export const useRosterMutations = () => {
  const { id: rosterId } = useParams();
  const openSidebar = useAppState((state) => state.openSidebar);
  const updateBuilderSidebar = useRosterBuildingState(
    (state) => state.updateBuilderSidebar,
  );
  const [roster, updateRoster] = useRosterBuildingState(
    (state): [Roster, (roster: Roster) => void] => [
      state.rosters.find(({ id }) => id === rosterId),
      state.updateRoster,
    ],
  );

  function addNewWarband() {
    const newWarbandId = randomUuid();
    updateRoster({
      ...roster,
      warbands: [
        ...roster.warbands,
        {
          ...emptyWarband,
          id: newWarbandId,
          meta: {
            ...emptyWarband.meta,
            num: roster.warbands.length + 1,
          },
        },
      ],
    });
    updateBuilderSidebar({
      armyList: rosterId,
      selectionType: "hero",
      selectionFocus: [newWarbandId, null],
    });
    openSidebar(DrawerTypes.UNIT_SELECTOR);
  }

  return {
    addNewWarband,
  };
};
