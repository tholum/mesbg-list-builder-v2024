import { Breadcrumbs } from "@mui/material";
import Typography from "@mui/material/Typography";
import { Link } from "../../components/common/link/Link.tsx";
import { useRosterBuildingState } from "../../state/roster-building";
import { RosterGroup } from "../../state/roster-building/groups";
import { Roster as RosterType } from "../../types/roster.ts";

export const RosterBreadcrumbs = ({ roster }: { roster: RosterType }) => {
  const group: RosterGroup | undefined = useRosterBuildingState(
    (state) =>
      roster.group && state.groups.find(({ id }) => roster.group === id),
  );
  return (
    <Breadcrumbs sx={{ mb: 1 }}>
      <Link
        to="/rosters"
        style={{
          textDecoration: "none",
        }}
      >
        My Rosters
      </Link>
      {group && (
        <Link
          to={`/rosters/${group.slug}`}
          style={{
            textDecoration: "none",
          }}
        >
          {group.name}
        </Link>
      )}
      <Typography sx={{ color: "text.secondary" }}>{roster.name}</Typography>
    </Breadcrumbs>
  );
};
