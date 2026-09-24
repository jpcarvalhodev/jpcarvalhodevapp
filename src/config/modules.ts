import type { Href } from "expo-router";
import type { SoftwareModule } from "../utils/softwareLicense";

export type ModuleCard = {
  tab: SoftwareModule;
  titleKey: string;
  route?: Href;
};

export const MODULE_CARDS: ModuleCard[] = [
  { tab: "nclock", titleKey: "attendance", route: "/devclock/dashboard" },
  { tab: "naccess", titleKey: "accesses", route: "/devaccess/dashboard" },
];
