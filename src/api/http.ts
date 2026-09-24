import i18n from "../i18n";
import { useMaintenanceStore } from "../store/maintenanceStore";
import { getAccessToken } from "../auth/accessToken";
import { BASE_URL } from "./config";

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

type AuthHandlers = {
  setToken: (token: string) => void;
  logout: (opts: { reason: "expired" | "session-replaced" }) => void;
};

let authHandlers: AuthHandlers | null = null;

export const registerAuthHandlers = (handlers: AuthHandlers) => {
  authHandlers = handlers;
};

const REFRESH_ENDPOINT = "Authentication/Refresh";

export type RefreshOutcome = "ok" | "invalid-session" | "network-error";

const currentLanguage = () => (i18n.language || "pt").split(/[-_]/)[0];

let refreshPromise: Promise<RefreshOutcome> | null = null;

const doRefresh = async (): Promise<RefreshOutcome> => {
  const { recordFailure, recordSuccess } = useMaintenanceStore.getState();

  try {
    const response = await fetch(`${BASE_URL}${REFRESH_ENDPOINT}`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      console.warn(`[auth] refresh failed with status ${response.status}`);
      if (response.status === 401 || response.status === 403) {
        recordSuccess();
        return "invalid-session";
      }
      recordFailure();
      return "network-error";
    }

    const data = await response.json();
    const newToken = data?.token ?? null;
    if (!newToken) {
      recordSuccess();
      return "invalid-session";
    }

    authHandlers?.setToken(newToken);
    recordSuccess();
    return "ok";
  } catch (error) {
    console.warn("[auth] refresh threw", error);
    recordFailure();
    return "network-error";
  }
};

export const refreshAccessToken = (): Promise<RefreshOutcome> => {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

const buildHeaders = (options: FetchOptions, token: string | null): Record<string, string> => {
  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
    "Accept-Language": currentLanguage(),
  };

  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData) && !headers["Content-Type"])
    headers["Content-Type"] = "application/json";

  return headers;
};

export const fetchWithAuth = async (
  endpoint: string,
  options: FetchOptions = {},
): Promise<Response> => {
  const url = `${BASE_URL}${endpoint}`;
  const { recordFailure, recordSuccess } = useMaintenanceStore.getState();

  const send = () =>
    fetch(url, {
      ...options,
      headers: buildHeaders(options, getAccessToken()),
      credentials: "include",
    });

  try {
    const response = await send();

    if (response.status >= 500) {
      recordFailure();
      logHTTPError(response.status, response.url);
      return response;
    }

    recordSuccess();

    if (response.status === 401 && !endpoint.startsWith(REFRESH_ENDPOINT)) {
      const errorData = await response
        .clone()
        .json()
        .catch(() => null);

      if (errorData?.code === "session-replaced") {
        authHandlers?.logout({ reason: "session-replaced" });
        return response;
      }

      const refreshed = await refreshAccessToken();
      if (refreshed === "ok") {
        const retryResponse = await send();
        if (retryResponse.status >= 500) recordFailure();
        else recordSuccess();
        if (!retryResponse.ok) logHTTPError(retryResponse.status, retryResponse.url);
        return retryResponse;
      }

      if (getAccessToken()) authHandlers?.logout({ reason: "expired" });
      return response;
    }

    if (!response.ok) logHTTPError(response.status, response.url);
    return response;
  } catch (error) {
    recordFailure();
    console.warn("Fetch error:", error);
    throw error;
  }
};

export const fetchWithoutAuth = async (
  endpoint: string,
  options: FetchOptions = {},
): Promise<Response> => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers: { "Accept-Language": currentLanguage(), ...(options.headers ?? {}) },
  });
  if (!response.ok) logHTTPError(response.status, response.url);
  return response;
};

const KNOWN_STATUS = new Set([400, 401, 403, 404, 405, 408, 415, 422, 429, 500, 501, 502, 503, 504, 505]);

const logHTTPError = (status: number, url: string) => {
  const key = KNOWN_STATUS.has(status) ? `components:${status}` : "components:unknownError";
  console.warn(`[http ${status}] ${url} -`, i18n.t(key));
};
