export type WarningRule = {
  type: "compulsory" | "requires_one" | "requires_all";
  dependencies: string[];
  warning: string;
};
export type WarningRules = Record<string, WarningRule[]>;
