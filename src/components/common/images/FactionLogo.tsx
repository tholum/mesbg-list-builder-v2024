import Avatar from "@mui/material/Avatar";
import { FunctionComponent } from "react";
import fallbackLogo from "../../../assets/images/default.png";

export type FactionLogoProps = {
  faction: string;
  size?: number;
};

export const FactionLogo: FunctionComponent<FactionLogoProps> = ({
  faction,
  size = 24,
}) => (
  <Avatar
    variant="square"
    alt={`${faction} logo`}
    src={`${RESOURCES_URL}/images/faction_logos/` + faction + ".png"}
    sx={{
      width: size,
      height: size,
      display: "inline-block",
      backgroundColor: "transparent",
      "& .image": {
        filter:
          "invert(1) sepia(1) saturate(1000%) hue-rotate(200deg) brightness(0.8)",
      },
    }}
  >
    <Avatar
      alt={`${faction} logo`}
      src={fallbackLogo}
      sx={{
        width: size,
        height: size,
        display: "inline-block",
        backgroundColor: "transparent",
      }}
    />
  </Avatar>
);
