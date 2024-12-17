import * as GandalfTheWhite from "./gandalf-the-white.ts";
import * as Treebeard from "./treebeard.ts";
import * as WarMumakCommanders from "./war-mumak-commanders.ts";

export default [
  GandalfTheWhite.handler,
  Treebeard.handler,
  WarMumakCommanders.handler,
];

export const handledModels = [
  ...GandalfTheWhite.handledModels,
  ...Treebeard.handledModels,
  ...WarMumakCommanders.handledModels,
];
