import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { useShallow } from "zustand/react/shallow";
import { AppState } from "react-native";
import type { UserAuthorizationResponse, AuthorizationFlags } from "../types/Types";
import * as apiService from "../api/apiService";
import { refreshAccessToken, registerAuthHandlers } from "../api/http";
import { setAccessToken } from "../auth/accessToken";
import { useMaintenanceStore } from "./maintenanceStore";
import { storage } from "../utils/storage";

export type RoleClaim = "Admin" | "User" | string;
export type LogoutReason = "expired" | "session-replaced";

export interface TokenClaims {
  exp?: number;
  nbf?: number;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: RoleClaim;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/username"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/email"?: string;
  role?: RoleClaim;
  username?: string;
  email?: string;
  employee_name?: string;
  enroll_number?: string | number;
  employee_id?: string;
  [k: string]: unknown;
}

const defaultFlags: AuthorizationFlags = {
  isSuperAdmin: false,
  canManageRoles: false,
  canAssignSystemRoles: false,
  hasEmployeeLink: false,
};

const LOCK_THRESHOLD = 3;
const LOCK_STEP_MS = 30_000;
const LOCK_MAX_AGE_MS = 10_800_000;

type AuthState = {
  token: string | null;
  claims: TokenClaims | null;
  role: RoleClaim | null;
  username: string | null;
  email: string | null;
  isAuthenticated: boolean;
  roles: string[];
  permissions: string[];
  flags: AuthorizationFlags;
  employeeId: string | null;
  authorizationLoaded: boolean;
  loginFailedAttempts: number;
  loginLockedUntil: number | null;
  isBootstrapping: boolean;
  bootstrapNetworkError: boolean;
  logoutReason: LogoutReason | null;
};

type AuthActions = {
  setToken: (token: string | null) => void;
  setAuthorization: (data: UserAuthorizationResponse) => void;
  clearAuthorization: () => void;
  logout: (opts?: { reason?: LogoutReason }) => void;
  consumeLogoutReason: () => LogoutReason | null;
  recordLoginFailure: () => void;
  resetLoginAttempts: () => void;
  isLoginLocked: () => boolean;
  loginRemainingMs: () => number;
};

export type AuthStore = AuthState & AuthActions;

let expiryTimer: ReturnType<typeof setTimeout> | null = null;
let bootstrapRetryTimer: ReturnType<typeof setTimeout> | null = null;
let listenersRegistered = false;

const SESSION_MARKER = "auth:session";
const LOCK_KEY = "auth:login-lock";

const hasSessionMarker = () => storage.getItem(SESSION_MARKER) === "1";
const setSessionMarker = (active: boolean) =>
  active ? storage.setItem(SESSION_MARKER, "1") : storage.removeItem(SESSION_MARKER);

type LockPayload = { attempts: number; lockedUntil: number | null; savedAt: number };

const readLock = (): LockPayload => {
  const empty = { attempts: 0, lockedUntil: null, savedAt: 0 };
  try {
    const raw = storage.getItem(LOCK_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as LockPayload;
    if (Date.now() - parsed.savedAt > LOCK_MAX_AGE_MS) return empty;
    return parsed;
  } catch {
    return empty;
  }
};

const writeLock = (attempts: number, lockedUntil: number | null) =>
  storage.setItem(LOCK_KEY, JSON.stringify({ attempts, lockedUntil, savedAt: Date.now() }));

const clearLock = () => storage.removeItem(LOCK_KEY);

const clearExpiryTimer = () => {
  if (expiryTimer) {
    clearTimeout(expiryTimer);
    expiryTimer = null;
  }
};

const clearBootstrapRetryTimer = () => {
  if (bootstrapRetryTimer) {
    clearTimeout(bootstrapRetryTimer);
    bootstrapRetryTimer = null;
  }
};

const safeDecode = (token: string | null): TokenClaims | null => {
  if (!token) return null;
  try {
    return jwtDecode<TokenClaims>(token);
  } catch {
    return null;
  }
};

const deriveAuthState = (token: string | null, claims: TokenClaims | null) => ({
  role:
    (claims?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as RoleClaim | undefined) ??
    claims?.role ??
    null,
  username:
    (claims?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/username"] as string | undefined) ??
    claims?.username ??
    null,
  email:
    (claims?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/email"] as string | undefined) ??
    claims?.email ??
    null,
  isAuthenticated: !!token && !!claims,
});

const scheduleExpiry = (claims: TokenClaims | null) => {
  clearExpiryTimer();
  if (!claims?.exp) return;

  const ms = claims.exp * 1000 - Date.now();
  if (ms <= 0) {
    void handleTokenExpiry();
    return;
  }

  expiryTimer = setTimeout(() => void handleTokenExpiry(), ms);
};

const initialLock = readLock();

const signedOutState = {
  token: null,
  claims: null,
  role: null,
  username: null,
  email: null,
  isAuthenticated: false,
  roles: [],
  permissions: [],
  flags: defaultFlags,
  employeeId: null,
  authorizationLoaded: false,
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...signedOutState,
  loginFailedAttempts: initialLock.attempts,
  loginLockedUntil:
    initialLock.lockedUntil != null && Date.now() < initialLock.lockedUntil
      ? initialLock.lockedUntil
      : null,
  isBootstrapping: hasSessionMarker(),
  bootstrapNetworkError: false,
  logoutReason: null,

  logout: (opts) => {
    clearExpiryTimer();
    clearBootstrapRetryTimer();
    setAccessToken(null);
    setSessionMarker(false);
    set({ ...signedOutState, logoutReason: opts?.reason ?? null });
  },

  consumeLogoutReason: () => {
    const reason = get().logoutReason;
    if (reason) set({ logoutReason: null });
    return reason;
  },

  setToken: (token) => {
    if (!token) {
      get().logout();
      return;
    }

    const decoded = safeDecode(token);
    setAccessToken(token);
    setSessionMarker(true);
    set({ token, claims: decoded, ...deriveAuthState(token, decoded), logoutReason: null });
    scheduleExpiry(decoded);
  },

  recordLoginFailure: () => {
    const next = get().loginFailedAttempts + 1;

    if (next >= LOCK_THRESHOLD) {
      const lockedUntil = Date.now() + (next - LOCK_THRESHOLD + 1) * LOCK_STEP_MS;
      set({ loginFailedAttempts: next, loginLockedUntil: lockedUntil });
      writeLock(next, lockedUntil);
    } else {
      set({ loginFailedAttempts: next });
      writeLock(next, null);
    }
  },

  resetLoginAttempts: () => {
    set({ loginFailedAttempts: 0, loginLockedUntil: null });
    clearLock();
  },

  isLoginLocked: () => {
    const { loginLockedUntil } = get();
    return loginLockedUntil != null && Date.now() < loginLockedUntil;
  },

  loginRemainingMs: () => {
    const { loginLockedUntil } = get();
    return loginLockedUntil == null ? 0 : Math.max(0, loginLockedUntil - Date.now());
  },

  setAuthorization: (data) =>
    set({
      roles: data.roles,
      permissions: data.permissions,
      flags: data.flags,
      employeeId: data.user?.employeeId ?? null,
      authorizationLoaded: true,
    }),

  clearAuthorization: () =>
    set({
      roles: [],
      permissions: [],
      flags: defaultFlags,
      employeeId: null,
      authorizationLoaded: false,
    }),
}));

registerAuthHandlers({
  setToken: (token) => useAuthStore.getState().setToken(token),
  logout: (opts) => useAuthStore.getState().logout(opts),
});

const handleTokenExpiry = async () => {
  const refreshed = await refreshAccessToken();
  if (refreshed !== "ok") {
    useAuthStore.getState().logout({ reason: "expired" });
  }
};

const fetchAuthorization = async () => {
  const { token, setAuthorization, clearAuthorization } = useAuthStore.getState();
  if (!token) {
    clearAuthorization();
    return;
  }

  try {
    setAuthorization(await apiService.getMeAuthorization());
  } catch {
    clearAuthorization();
  }
};

const BOOTSTRAP_RETRY_MS = 5_000;

const bootstrapSession = async () => {
  clearBootstrapRetryTimer();
  try {
    const outcome = await refreshAccessToken();
    const isNetworkError = outcome === "network-error";
    useAuthStore.setState({ bootstrapNetworkError: isNetworkError });

    if (outcome === "invalid-session") setSessionMarker(false);
    if (isNetworkError) {
      bootstrapRetryTimer = setTimeout(() => void bootstrapSession(), BOOTSTRAP_RETRY_MS);
    }
  } finally {
    useAuthStore.setState({ isBootstrapping: false });
  }
};

export const initAuthStore = (): (() => void) => {
  if (listenersRegistered) return () => {};
  listenersRegistered = true;

  const unsubscribeToken = useAuthStore.subscribe((state, prev) => {
    if (state.token !== prev.token) void fetchAuthorization();
  });

  const unsubscribeMaintenance = useMaintenanceStore.subscribe((state, prev) => {
    if (prev.isMaintenance && !state.isMaintenance) {
      const { bootstrapNetworkError, isAuthenticated } = useAuthStore.getState();
      if (bootstrapNetworkError && !isAuthenticated) {
        useAuthStore.setState({ isBootstrapping: true });
        void bootstrapSession();
      }
    }
  });

  const appStateSub = AppState.addEventListener("change", (next) => {
    if (next !== "active") return;
    const { claims, isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated && claims?.exp && claims.exp * 1000 <= Date.now()) {
      void handleTokenExpiry();
    }
  });

  if (useAuthStore.getState().isBootstrapping) {
    void bootstrapSession();
  }

  return () => {
    unsubscribeToken();
    unsubscribeMaintenance();
    appStateSub.remove();
    clearExpiryTimer();
    clearBootstrapRetryTimer();
    listenersRegistered = false;
  };
};

export const useAuthToken = () => useAuthStore((s) => s.token);
export const useAuthData = () =>
  useAuthStore(
    useShallow((s) => ({
      token: s.token,
      claims: s.claims,
      role: s.role,
      username: s.username,
      email: s.email,
      isAuthenticated: s.isAuthenticated,
      roles: s.roles,
      permissions: s.permissions,
      flags: s.flags,
      employeeId: s.employeeId,
      hasEmployeeLink: s.flags.hasEmployeeLink,
      authorizationLoaded: s.authorizationLoaded,
      isBootstrapping: s.isBootstrapping,
      bootstrapNetworkError: s.bootstrapNetworkError,
    })),
  );
export const useAuthUser = () =>
  useAuthStore(
    useShallow((s) => ({
      role: s.role,
      username: s.username,
      email: s.email,
      claims: s.claims,
      isAuthenticated: s.isAuthenticated,
      isBootstrapping: s.isBootstrapping,
      roles: s.roles,
      permissions: s.permissions,
      flags: s.flags,
      employeeId: s.employeeId,
      hasEmployeeLink: s.flags.hasEmployeeLink,
      authorizationLoaded: s.authorizationLoaded,
    })),
  );
export const useAuthActions = () =>
  useAuthStore(
    useShallow((s) => ({
      setToken: s.setToken,
      setAuthorization: s.setAuthorization,
      clearAuthorization: s.clearAuthorization,
      logout: s.logout,
      recordLoginFailure: s.recordLoginFailure,
      resetLoginAttempts: s.resetLoginAttempts,
      isLoginLocked: s.isLoginLocked,
      loginRemainingMs: s.loginRemainingMs,
    })),
  );

export const useLoginLockState = () =>
  useAuthStore(
    useShallow((s) => ({
      loginFailedAttempts: s.loginFailedAttempts,
      loginLockedUntil: s.loginLockedUntil,
    })),
  );

export const hasPermissions = (
  userPermissions: string[],
  flags: AuthorizationFlags,
  required?: string[],
) => {
  if (flags.isSuperAdmin) return true;
  if (!required || required.length === 0) return true;
  return required.every((p) => userPermissions.includes(p));
};
