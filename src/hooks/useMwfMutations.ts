import { Option } from "../types/mesbg-data.types.ts";
import { SelectedUnit } from "../types/roster.ts";
import { GandalfTheWhite, Treebeard } from "./mwfw";

export interface MwfwUpdater {
  isMatchingUnit: (unitId: string) => boolean;
  update: (unit: SelectedUnit, options: Option[]) => SelectedUnit["MWFW"];
}

const handlers = [GandalfTheWhite, Treebeard];

export const useMwfMutations = () => {
  function hasSpecialMwfRules(unit: SelectedUnit): boolean {
    return [
      "[defenders-of-the-pelennor] gandalf-the-white",
      "[men-of-the-west] gandalf-the-white",
      "[atop-the-walls] gandalf-the-white",
      "[riders-of-eomer] gandalf-the-white",
      "[fangorn] treebeard",
    ].includes(unit.model_id);
  }

  function handleSpecialMwfForUnit(
    unit: SelectedUnit,
    options: Option[],
  ): SelectedUnit["MWFW"] {
    if (!hasSpecialMwfRules(unit)) return unit.MWFW;

    const handler = handlers.find((handler) =>
      handler.isMatchingUnit(unit.model_id),
    );
    if (!handler) {
      console.error(
        "No handler found to handle MWFW for unit which is listed in the hasSpecialMwfRules list!",
        unit.model_id,
      );
      return unit.MWFW; // Fallback to default MWFW.
    }

    return handler.update(unit, options);
  }

  return {
    hasSpecialMwfRules,
    handleSpecialMwfForUnit,
  };
};
