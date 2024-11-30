export type KeywordsType = {
  name: string;
  type: "special_rule" | "magical_power" | "heroic_action";
  active_passive: "Active" | "Passive" | null;
  description: string;
}[];
