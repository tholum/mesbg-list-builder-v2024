import { Unit } from "../../../types/mesbg-data.types.ts";

export function handleBreakingOfTheFellowshipRestriction(unit: Unit) {
  return unit.army_list === "Breaking of the Fellowship"
    ? [
        "[breaking-of-the-fellowship] haldir-galadhrim-captain",
        "[breaking-of-the-fellowship] aragorn-strider",
      ].includes(unit.model_id)
    : true; // defaults to true for non BotF units.
}

export const handleSpecialRestriction = (unit: Unit) => {
  return [handleBreakingOfTheFellowshipRestriction].every((restriction) =>
    restriction(unit),
  );
};
