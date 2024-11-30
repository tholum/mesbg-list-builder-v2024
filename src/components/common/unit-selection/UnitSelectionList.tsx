import { TextField } from "@mui/material";
import Stack from "@mui/material/Stack";
import { ChangeEvent, FunctionComponent, useState } from "react";
import heroConstraints from "../../../assets/data/hero_constraint_data.json";
import data from "../../../assets/data/mesbg_data.json";
import { HeroConstraintsDataType } from "../../../types/hero-constraints-data.type.ts";
import { Unit } from "../../../types/mesbg-data.types.ts";
import { useRosterInformation } from "../warbands/useRosterInformation.ts";
import { UnitSelectionButton } from "./UnitSelectionButton.tsx";

export type UnitSelectionListProps = {
  leadingHeroModelId: string;
  selectUnit: (unit: Unit) => void;
};

export const UnitSelectionList: FunctionComponent<UnitSelectionListProps> = ({
  leadingHeroModelId,
  selectUnit,
}) => {
  const selectedModels = useRosterInformation().getSetOfModelIds();
  const [filter, setFilter] = useState("");

  const unitIds =
    (heroConstraints as HeroConstraintsDataType)[leadingHeroModelId]
      ?.valid_warband_units || [];

  const units = unitIds
    .map((modelId) => data[modelId])
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
      {units
        .filter((unit) =>
          unit.name.toLowerCase().includes(filter.toLowerCase()),
        )
        .map((unit) => (
          <UnitSelectionButton
            key={unit.model_id}
            unit={unit}
            onClick={() => selectUnit(unit)}
          />
        ))}
    </Stack>
  );
};
