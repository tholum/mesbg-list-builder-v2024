import keywords from "../../../assets/data/keywords.json";
import { KeywordSearch } from "./KeywordSearch.tsx";

export const SpecialRulesSearch = () => {
  const allSpecialRules = keywords.filter(
    (keyword) => keyword.type === "special_rule",
  );

  return <KeywordSearch keywords={allSpecialRules} />;
};
