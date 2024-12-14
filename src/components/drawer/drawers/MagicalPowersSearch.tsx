import keywords from "../../../assets/data/keywords.json";
import { KeywordSearch } from "./KeywordSearch.tsx";

export const MagicalPowersSearch = () => {
  const allMagicalPowers = keywords.filter(
    (keyword) => keyword.type === "magical_power",
  );

  return <KeywordSearch keywords={allMagicalPowers} />;
};
