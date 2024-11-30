export type ArmyListData = Record<
  string,
  {
    additional_rules: {
      description: string;
    }[];
    special_rules: {
      title: string;
      description: string;
    }[];
    bow_limit: number;
    throw_limit: number;
    break_point?: number;
  }
>;
