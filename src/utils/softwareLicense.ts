import type { License } from "../types/Types";

export const ALL_SOFTWARE_MODULES = [
  "nclock",
  "naccess",
  "nvisitor",
  "npark",
  "ndoor",
  "npatrol",
  "ncard",
  "nview",
  "nsecur",
  "nsoftware",
  "nsystem",
  "napp",
  "ncyber",
  "ndigital",
  "nserver",
  "naut",
  "nequip",
  "nproject",
  "ncount",
  "nbuild",
  "ncaravan",
  "nmechanic",
  "nevents",
  "nservice",
  "ntask",
  "nproduction",
  "nticket",
  "nsales",
  "ninvoice",
  "ndoc",
  "nsports",
  "ngym",
  "nschool",
  "nclinic",
  "noptics",
  "ngold",
  "nstore",
  "nsmart",
  "nreality",
  "nhologram",
  "npower",
  "ncharge",
  "ncity",
  "nkiosk",
  "nled",
  "nfire",
  "nfurniture",
  "npartition",
  "ndecor",
  "nping",
  "nconnect",
  "nlight",
  "ncomfort",
  "nsound",
  "nhome",
] as const;

export type SoftwareModule = (typeof ALL_SOFTWARE_MODULES)[number];
export type SoftwareEnabledMap = Record<SoftwareModule, boolean>;

export const emptySoftwareEnabled = (): SoftwareEnabledMap =>
  ALL_SOFTWARE_MODULES.reduce((acc, moduleName) => {
    acc[moduleName] = false;
    return acc;
  }, {} as SoftwareEnabledMap);

export const computeSoftwareEnabled = (
  licenses: License[],
  nif: string | null,
): SoftwareEnabledMap => {
  if (!Array.isArray(licenses) || licenses.length === 0 || !nif) {
    return emptySoftwareEnabled();
  }

  const current = licenses.find((lic) => String(lic?.nif) === String(nif));
  if (!current) return emptySoftwareEnabled();

  const enabled: SoftwareEnabledMap = emptySoftwareEnabled();

  ALL_SOFTWARE_MODULES.forEach((moduleName) => {
    const moduleData = (current as unknown as Record<string, unknown>)[
      moduleName
    ] as { enable?: boolean } | undefined;

    enabled[moduleName] = Boolean(
      moduleData &&
      typeof moduleData === "object" &&
      moduleData.enable === true,
    );
  });

  return enabled;
};
