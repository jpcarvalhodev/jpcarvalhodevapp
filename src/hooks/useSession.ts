import { useCallback, useMemo, useState } from "react";
import { useActiveDisabledEmployeesQuery, useRegisteredUsersQuery } from "../query/personsQuery";
import { fetchWithAuth } from "../api/http";
import { getAccessToken } from "../auth/accessToken";
import { useAuthActions } from "../store/authStore";
import { baseURL } from "../api/apiService";
import { queryClient } from "../query/queryClient";
import { storage } from "../utils/storage";
import { useDataStore } from "../store/dataStore";

export const sessionKeys = {
  employeeId: "employeeId",
  enrollNumber: "enrollNumber",
  username: "username",
  nif: "nif",
  rememberUser: "rememberMeUser",
  rememberNif: "rememberMeNif",
} as const;

export const getSessionValue = (key: Exclude<keyof typeof sessionKeys, "enrollNumber">) =>
  storage.getItem(sessionKeys[key]);

export const getEnrollNumber = (): string | null => useDataStore.getState().employees?.[0] ?? null;

export const useLogout = () => {
  const { logout } = useAuthActions();
  const [loggingOut, setLoggingOut] = useState(false);

  const doLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await fetchWithAuth("Authentication/Logout", {
        method: "POST",
        body: JSON.stringify({ token: getAccessToken() }),
      });
    } catch (error) {
      console.warn("An error occurred while trying to logout:", error);
    } finally {
      logout();
      queryClient.clear();
      setLoggingOut(false);
    }
  }, [logout]);

  return { logout: doLogout, loggingOut };
};

const toAbsoluteProfileImage = (relativePath: string) => {
  const path = relativePath.trim();
  if (!path) return null;
  if (path.startsWith("data:image") || /^https?:\/\//i.test(path)) return path;
  const base = baseURL.replace(/\/+$/, "");
  return `${base}/${path.replace(/^\/+/, "")}`;
};

export const useUserPhoto = (): string | null => {
  const { data: employees = [] } = useActiveDisabledEmployeesQuery();
  const { data: registeredUsers = [] } = useRegisteredUsersQuery();

  return useMemo(() => {
    const normalize = (v: unknown) => String(v ?? "").trim().toLowerCase();
    const enrollNumber = getEnrollNumber();
    const username = getSessionValue("username");

    if (enrollNumber && employees.length) {
      const employee = employees.find((e: any) => String(e.enrollNumber) === String(enrollNumber));
      if (employee?.photo) {
        return employee.photo.startsWith("data:image") ? employee.photo : `data:image/jpeg;base64,${employee.photo}`;
      }
    }

    if (username && registeredUsers.length) {
      const user = registeredUsers.find((u) => normalize(u?.userName) === normalize(username));
      if (typeof user?.profileImage === "string" && user.profileImage.trim()) {
        return toAbsoluteProfileImage(user.profileImage);
      }
    }

    return null;
  }, [employees, registeredUsers]);
};
