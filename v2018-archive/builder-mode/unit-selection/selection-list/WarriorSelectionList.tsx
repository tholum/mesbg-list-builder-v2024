import { FunctionComponent } from "react";
import { v4 as uuid } from "uuid";
import { UnitSelectionButton } from "../../../../src/components/common/unit-selection/UnitSelectionButton.tsx";
import { useMesbgData } from "../../../../src/hooks/mesbg-data.ts";

type WarriorSelectionListProps = {
  filter: string;
};

export const WarriorSelectionList: FunctionComponent<
  WarriorSelectionListProps
> = ({ filter }) => {
  const { getEligibleWarbandUnits } = useMesbgData();

  return (
    <>
      {getEligibleWarbandUnits()
        .filter((unit) =>
          unit.name.toLowerCase().includes(filter?.toLowerCase()),
        )
        .map((row) => (
          <UnitSelectionButton key={uuid()} unitData={row} />
        ))}
    </>
  );
};
