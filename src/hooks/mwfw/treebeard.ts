import { mesbgData } from "../../assets/data.ts";
import { Option } from "../../types/mesbg-data.types.ts";
import { SelectedUnit } from "../../types/roster.ts";
import { MwfwUpdater } from "../useMwfMutations.ts";
import { selectedOptionWithName } from "./utils.ts";

export const Treebeard: MwfwUpdater = {
  isMatchingUnit(unitId: string): boolean {
    return ["[fangorn] treebeard"].includes(unitId);
  },
  update(unit: SelectedUnit, options: Option[]): SelectedUnit["MWFW"] {
    const hasMerryAndPippin = !!options.find(
      selectedOptionWithName("Merry & Pippin"),
    );

    const untouchedMWFW = mesbgData[unit.model_id].MWFW;

    if (!hasMerryAndPippin) {
      return untouchedMWFW;
    }

    return [
      untouchedMWFW[0],
      ["Peregrin Took", "0:0:2:1"],
      ["Meriadoc Brandybuck", "0:0:2:1"],
    ];
  },
};
