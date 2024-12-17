import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Fragment } from "react";
import { useRosterInformation } from "../../../../hooks/useRosterInformation.ts";
import {
  FreshUnit,
  isSelectedUnit,
  SelectedUnit,
} from "../../../../types/roster.ts";

function UnitRow({ unit }: { unit: FreshUnit | SelectedUnit }) {
  if (!isSelectedUnit(unit)) {
    return (
      <TableRow>
        <TableCell size="small" colSpan={2}>
          No Hero selected
        </TableCell>
      </TableRow>
    );
  }

  const options = unit?.options?.filter((option) => option.quantity > 0) || [];
  return (
    <TableRow>
      <TableCell size="small" width={12}>
        {unit.quantity}x
      </TableCell>
      <TableCell size="small">
        {unit.name}{" "}
        {options.length > 0 && (
          <>
            (
            {options
              ?.map(
                ({ quantity, max, name }) =>
                  `${max > 1 ? `${quantity} ` : ""}${name}`,
              )
              ?.join(", ")}
            )
          </>
        )}
      </TableCell>
    </TableRow>
  );
}

export const ArmyComposition = () => {
  const { roster } = useRosterInformation();

  const warbands = roster.warbands.map((warband) => [
    warband.hero,
    ...warband.units.filter(isSelectedUnit),
  ]);

  return (
    <Box id="pdf-army">
      <Typography variant="h5" sx={{ mb: 2 }}>
        Army Composition
      </Typography>
      <Stack direction="row" gap={2} sx={{ mb: 1 }}>
        <Typography>
          Points: <b>{roster.metadata.points}</b>
        </Typography>
        <Typography>
          Units: <b>{roster.metadata.units}</b>
        </Typography>
        <Typography>
          Break Point:{" "}
          <b>{Math.round(0.5 * roster.metadata.units * 100) / 100}</b>
        </Typography>
        <Typography>
          Bows: <b>{roster.metadata.bows}</b>
        </Typography>
        <Typography>
          Might: <b>{roster.metadata.might}</b>
        </Typography>
      </Stack>
      <TableContainer component="div">
        <Table>
          <TableBody>
            {warbands.map((warband, index) => (
              <Fragment key={index}>
                <TableRow>
                  <TableCell
                    size="small"
                    colSpan={2}
                    sx={{ textAlign: "center", backgroundColor: "#F3F3F3" }}
                  >
                    Warband {index + 1}
                  </TableCell>
                </TableRow>
                {warband.map((unit, index) => (
                  <UnitRow unit={unit} key={index} />
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
