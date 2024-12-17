import { TextField } from "@mui/material";
import Stack from "@mui/material/Stack";
import { ChangeEvent, FunctionComponent, useState } from "react";
import data from "../../../assets/data/mesbg_data.json";
import { useRosterInformation } from "../../../hooks/useRosterInformation.ts";
import { Unit } from "../../../types/mesbg-data.types.ts";
import { UnitSelectionButton } from "./UnitSelectionButton.tsx";
import { handleSpecialRestriction } from "./special-hero-selection-rules.ts";

export type HeroSelectionListProps = {
  armyList: string;
  selectUnit: (unit: Unit) => void;
};

export const HeroSelectionList: FunctionComponent<HeroSelectionListProps> = ({
  armyList,
  selectUnit,
}) => {
  const selectedModels = useRosterInformation().getSetOfModelIds();
  const [filter, setFilter] = useState("");

  const heroes: Unit[] = Object.values(data as Record<string, Unit>)
    .filter(
      (unit) =>
        unit.unit_type.includes("Hero") || unit.unit_type === "Siege Engine",
    )
    .filter((unit) => unit.army_list === armyList)
    .filter(handleSpecialRestriction)
    .filter(
      (unit: Unit) => !unit.unique || !selectedModels.includes(unit.model_id),
    );

  return (
    <Stack gap={1.5}>
      <TextField
        id="hero-selection-list--name-filter"
        label="Filter"
        placeholder="Filter heroes by name..."
        value={filter}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setFilter(event.target.value);
        }}
      />
      {heroes
        .filter((hero) =>
          hero.name.toLowerCase().includes(filter.toLowerCase()),
        )
        .map((hero) => (
          <UnitSelectionButton
            key={hero.model_id}
            unit={hero}
            onClick={() => selectUnit(hero)}
          />
        ))}
    </Stack>
  );
};
