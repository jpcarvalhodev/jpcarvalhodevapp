import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";
import { AuthShell } from "../components/AuthShell";
import { LanguagePicker } from "../components/LanguagePicker";
import { PasswordField, TextField } from "../components/Form";
import { SelectField } from "../components/SelectField";
import { Button } from "../components/Button";
import { MaintenanceModal } from "../components/MaintenanceModal";
import { fetchWithoutAuth } from "../api/http";
import * as apiService from "../api/apiService";
import { useAuthStore, useLoginLockState } from "../store/authStore";
import { useDataStore } from "../store/dataStore";
import { sessionKeys } from "../hooks/useSession";
import { storage } from "../utils/storage";
import { toast } from "../utils/toast";
import { EMPTY_ARRAY } from "../utils/emptyArray";
import type { License } from "../types/Types";

type User = {
  username?: string | null;
  email?: string | null;
  entidadeNif: number | null;
  password: string;
  companyId: string | null;
};

const isEmail = (input: string): boolean => /\S+@\S+\.\S+/.test(input);

export default function LoginScreen() {
  const { t } = useTranslation("login");
  const setToken = useAuthStore((s) => s.setToken);
  const recordLoginFailure = useAuthStore((s) => s.recordLoginFailure);
  const resetLoginAttempts = useAuthStore((s) => s.resetLoginAttempts);
  const isLoginLocked = useAuthStore((s) => s.isLoginLocked);
  const consumeLogoutReason = useAuthStore((s) => s.consumeLogoutReason);
  const { loginLockedUntil } = useLoginLockState();
  const rememberedUsername = storage.getItem(sessionKeys.rememberUser) ?? "";
  const rememberedNif = Number(storage.getItem(sessionKeys.rememberNif) ?? 0);
  const hasRemembered = Boolean(rememberedUsername) && Boolean(rememberedNif);
  const [now, setNow] = useState(() => Date.now());
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [username, setUsername] = useState(
    hasRemembered ? rememberedUsername : "",
  );
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(hasRemembered);
  const [pickedNif, setPickedNif] = useState<number>(
    hasRemembered ? rememberedNif : 0,
  );

  const {
    data: companies = EMPTY_ARRAY as License[],
    isError: fetchCompanyError,
  } = useQuery({
    queryKey: ["login", "entities"],
    queryFn: async () =>
      ((await apiService.fetchAllEntidadesByNif()) ?? []) as License[],
    retry: false,
  });

  const selectedNif = companies.some((c) => Number(c.nif) === pickedNif)
    ? pickedNif
    : Number(companies[0]?.nif ?? 0);

  const lockCountdown = loginLockedUntil
    ? Math.ceil(Math.max(0, loginLockedUntil - now) / 1000)
    : 0;

  useEffect(() => {
    if (!loginLockedUntil) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [loginLockedUntil]);

  useEffect(() => {
    if (lockCountdown <= 0) {
      toast.dismiss("login-locked");
      return;
    }
    toast.warn(t("login_locked", { seconds: lockCountdown }), {
      toastId: "login-locked",
      autoClose: false,
    });
  }, [lockCountdown, t]);

  useEffect(() => {
    const reason = consumeLogoutReason();
    if (reason) {
      toast.info(
        reason === "expired" ? t("expiredSession") : t("sessionReplaced"),
        { toastId: `logout-${reason}` },
      );
    }
  }, [consumeLogoutReason, t]);

  const handleLogin = async () => {
    if (isLoginLocked()) {
      toast.warn(t("login_locked_toast", { seconds: lockCountdown }), {
        toastId: "login-locked",
      });
      return;
    }

    const company = companies.find((c) => Number(c.nif) === selectedNif);
    if (!selectedNif || !company) return;
    if (!username.trim() || !password) return;

    setIsLoggingIn(true);

    const user: User = {
      ...(isEmail(username) ? { email: username } : { username }),
      entidadeNif: selectedNif,
      companyId: company.id ?? null,
      password,
    };

    try {
      const response = await fetchWithoutAuth("Authentication/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const message =
          response.status === 401
            ? t("login_invalid_credentials")
            : ((await response.json().catch(() => null))?.message ??
              t("login_error"));
        toast.error(message, { toastId: "login-error" });
        recordLoginFailure();
        setIsLoggingIn(false);
        return;
      }

      const data = await response.json();
      const token: string = data.response.token;
      const usernameApi: string = data.response.username || username;
      resetLoginAttempts();

      let decoded: { enroll_number?: unknown; employee_id?: unknown } | null =
        null;
      try {
        decoded = jwtDecode(token);
      } catch (e) {
        console.warn("JWT decode failed", e);
      }

      const enroll = decoded?.enroll_number;
      const employeeId = decoded?.employee_id;
      if (employeeId != null)
        storage.setItem(sessionKeys.employeeId, String(employeeId));
      else storage.removeItem(sessionKeys.employeeId);
      useDataStore
        .getState()
        .setEmployees(enroll != null ? [String(enroll)] : undefined);

      storage.setItem(sessionKeys.username, usernameApi);
      storage.setItem(sessionKeys.nif, String(selectedNif));
      if (rememberMe) {
        storage.setItem(sessionKeys.rememberUser, username);
        storage.setItem(sessionKeys.rememberNif, String(selectedNif));
      } else {
        storage.removeItem(sessionKeys.rememberUser);
        storage.removeItem(sessionKeys.rememberNif);
      }

      toast.info(t("welcome_message", { user: usernameApi.toUpperCase() }), {
        toastId: "login-welcome",
      });
      setToken(token);
    } catch (error) {
      console.warn("Login error:", error);
      toast.error(t("login_error"), { toastId: "login-error" });
      setIsLoggingIn(false);
    }
  };

  return (
    <AuthShell headerRight={<LanguagePicker />} busy={isLoggingIn}>
      <SelectField
        label={t("licensed_company")}
        value={selectedNif || undefined}
        allowEmpty={false}
        options={companies.map((c) => ({
          value: Number(c.nif),
          label: c.nome ?? String(c.nif),
        }))}
        onChange={(v) => setPickedNif(v ?? 0)}
      />
      <TextField
        label={t("username")}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
      />
      <PasswordField
        label={t("password")}
        value={password}
        onChangeText={setPassword}
        autoComplete="password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleLogin}
      />
      <Button
        title={t("enter")}
        onPress={handleLogin}
        disabled={lockCountdown > 0}
        style={styles.submit}
      />
      <View style={styles.options}>
        <Pressable
          onPress={() => setRememberMe((v) => !v)}
          style={styles.remember}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: rememberMe }}
          hitSlop={6}
        >
          <Ionicons
            name={rememberMe ? "checkbox" : "square-outline"}
            size={18}
            color={rememberMe ? "#0d6efd" : "#666666"}
          />
          <Text style={styles.rememberText}>{t("remember")}</Text>
        </Pressable>
        <Link href="/forgot-password" asChild>
          <Pressable hitSlop={6}>
            <Text style={styles.link}>{t("recover_password")}</Text>
          </Pressable>
        </Link>
      </View>
      <MaintenanceModal show={fetchCompanyError} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  submit: { marginTop: 12 },
  options: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  remember: { flexDirection: "row", alignItems: "center", gap: 8 },
  rememberText: { color: "#666666", fontSize: 13.6 },
  link: { color: "#666666", fontWeight: "500", fontSize: 13.6 },
});
