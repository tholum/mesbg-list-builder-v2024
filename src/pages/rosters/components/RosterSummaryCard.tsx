import { capitalize } from "@mui/material";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FunctionComponent } from "react";
import { Link } from "react-router-dom";
import { FactionLogo } from "../../../components/common/images/FactionLogo.tsx";

export type RosterSummaryCardProps = {
  id: string;
  armyList: string;
  name: string;
  points: number;
  warbands: number;
  units: number;
  bows: number;
  throwing_weapons: number;
  might: number;
};

const KeyValue = ({ label, value }) => {
  return (
    <Typography fontSize="1.2rem">
      {capitalize(label).replaceAll("_", " ")}{" "}
      <b style={{ float: "right" }}>{value}</b>
    </Typography>
  );
};

export const RosterSummaryCard: FunctionComponent<RosterSummaryCardProps> = ({
  id,
  name,
  armyList,
  ...rest
}) => {
  return (
    <Link
      to={`/roster/${id}`}
      style={{ textDecoration: "none", color: "inherit" }}
      data-test-id={"rosters--" + id + "--link"}
    >
      <Card sx={{ width: "40ch", height: "350px", p: 2 }} elevation={4}>
        <Stack>
          <center>
            <Typography
              variant="h6"
              className="middle-earth"
              sx={{
                whiteSpace: "nowrap", // Prevent text from wrapping
                overflow: "hidden", // Hide the overflowing text
                textOverflow: "ellipsis", // Show ellipsis when text overflows
                width: "300px", // Set a fixed width or max-width for overflow
              }}
            >
              {name}
            </Typography>
            <FactionLogo faction={armyList} size={62} />
            <Typography
              variant="body2"
              sx={{
                textDecoration: "underline",
                color: ({ palette }) => palette.grey.A700,
              }}
            >
              <i>{armyList}</i>
            </Typography>
          </center>

          <Stack sx={{ my: 2 }}>
            {Object.entries(rest).map(([key, value]) => (
              <KeyValue key={key} label={key} value={value} />
            ))}
          </Stack>
        </Stack>
      </Card>
    </Link>
  );
};
