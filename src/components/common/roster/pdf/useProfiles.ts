import { useRosterInformation } from "../../warbands/useRosterInformation.ts";
import { convertRosterToProfiles } from "./profiles/profiles.ts";

export const useProfiles = () => {
  const { roster } = useRosterInformation();
  const profileData = convertRosterToProfiles(roster);

  return {
    profiles: profileData.profiles,
    missingProfiles: profileData.missing,
  };
};
