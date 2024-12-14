import Chip from "@mui/material/Chip";
import { FunctionComponent } from "react";

export type UnitTypeLabelProps = {
  unitType: string;
};

export const UnitTypeLabel: FunctionComponent<UnitTypeLabelProps> = ({
  unitType,
}) => {
  return (
    <Chip
      label={unitType}
      size="small"
      sx={{
        backgroundColor: "black",
        color: "white",
        fontWeight: "bold",
      }}
      data-test-id="unit-type"
    />
  );
};
