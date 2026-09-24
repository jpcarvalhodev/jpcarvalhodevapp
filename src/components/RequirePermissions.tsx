import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { hasPermissions, useAuthData } from "../store/authStore";
import { colors } from "../theme";

type Props = {
  permissions?: string[];
  children: ReactNode;
};

export const RequirePermissions = ({ permissions, children }: Props) => {
  const { t } = useTranslation("mobile");
  const { permissions: userPermissions, flags, authorizationLoaded } = useAuthData();

  if (flags.isSuperAdmin || !permissions?.length) return <>{children}</>;

  if (!authorizationLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.muted} />
      </View>
    );
  }

  if (!hasPermissions(userPermissions, flags, permissions)) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={40} color={colors.muted} />
        <Text style={styles.text}>{t("no_permission")}</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  text: { color: colors.muted, textAlign: "center", fontSize: 15 },
});
