import * as apiService from "../api/apiService";
import type { License } from "../types/Types";
import { computeSoftwareEnabled } from "../utils/softwareLicense";
import { useStoreQuery } from "./queryHooks";

export const licenseKeys = {
  all: ["license"] as const,
  withoutKey: ["license", "withoutKey"] as const,
};

export const useLicensesWithoutKeyQuery = () =>
  useStoreQuery({
    queryKey: licenseKeys.withoutKey,
    queryFn: apiService.fetchLicensesWithoutKey,
    select: (response) =>
      Array.isArray(response) ? (response as License[]) : [],
  });

export const useSoftwareEnabledQuery = (nif?: string | null) =>
  useStoreQuery({
    queryKey: licenseKeys.withoutKey,
    queryFn: apiService.fetchLicensesWithoutKey,
    select: (licenses) =>
      computeSoftwareEnabled(
        Array.isArray(licenses) ? (licenses as License[]) : [],
        nif ?? null,
      ),
  });
