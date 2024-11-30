import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FunctionComponent } from "react";
import { GiQueenCrown } from "react-icons/gi";
import { CustomSwitch as Switch } from "../../common/switch/CustomSwitch.tsx";

export type HeroLeaderToggleProps = {
  isLeader: boolean;
  isLeaderCompulsory: boolean;
  handleToggle: (boolean: boolean) => void;
  testId?: string;
  testName?: string;
};

export const LeaderToggle: FunctionComponent<HeroLeaderToggleProps> = ({
  isLeader,
  isLeaderCompulsory,
  handleToggle,
  testId,
  testName,
}) => {
  if (!isLeader && isLeaderCompulsory) return <></>;

  const textColor = isLeader ? "success" : "default";
  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      color={textColor}
    >
      <Typography color={textColor} display="flex" justifyContent="center">
        <GiQueenCrown />
      </Typography>
      <Switch
        name="leader-toggle"
        checked={isLeader}
        color={textColor}
        disabled={isLeaderCompulsory}
        onChange={(_, checked) => handleToggle(checked)}
        data-test-id={testId}
        data-test-unit-name={testName}
      />
    </Stack>
  );
};
