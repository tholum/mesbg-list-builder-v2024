import { useRosterInformation } from "../../hooks/calculations-and-displays/useRosterInformation.ts";
import { RosterNotFound } from "../not-found/RosterNotFound.tsx";
import { RosterData } from "./RosterData.tsx";

export const Roster = () => {
  const { roster } = useRosterInformation();

  return !roster ? <RosterNotFound /> : <RosterData roster={roster} />;
};
