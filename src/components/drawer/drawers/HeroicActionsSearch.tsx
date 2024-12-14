import keywords from "../../../assets/data/keywords.json";
import { KeywordSearch } from "./KeywordSearch.tsx";

export const HeroicActionsSearch = () => {
  const allHeroicActions = keywords.filter(
    (keyword) => keyword.type === "heroic_action",
  );

  return <KeywordSearch keywords={allHeroicActions} />;
};
