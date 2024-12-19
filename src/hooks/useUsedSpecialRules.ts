import { useProfiles } from "./useProfiles.ts";

export const useUsedSpecialRules = () => {
  try {
    const profiles = useProfiles();
    return profiles.profiles
      .flatMap((profile) => profile.special_rules)
      .map((keyword) => keyword.replace(/\(.*?\)/g, "(X)"));
  } catch {
    return [];
  }
};
