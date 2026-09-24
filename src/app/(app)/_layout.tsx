import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSoftwareEnabledQuery } from "../../query/licenseQuery";
import { emptySoftwareEnabled } from "../../utils/softwareLicense";
import { useAuthData } from "../../store/authStore";
import { useMaintenanceStore } from "../../store/maintenanceStore";
import { MaintenanceModal } from "../../components/MaintenanceModal";
import { Button } from "../../components/Button";
import { getSessionValue, useLogout } from "../../hooks/useSession";
import { colors } from "../../theme";

// Port do AppRoutes (routes.tsx): valida a licença Napp e a permissão Napp.View antes de mostrar qualquer módulo
export default function AppLayout() {
  const { t } = useTranslation("components");
  const isMaintenance = useMaintenanceStore((s) => s.isMaintenance);
  const { permissions, flags, authorizationLoaded } = useAuthData();
  const { logout, loggingOut } = useLogout();
  const {
    data: softwareEnabled = emptySoftwareEnabled(),
    isLoading,
    isError,
  } = useSoftwareEnabledQuery(getSessionValue("nif"));

  const hasNappPermission = flags.isSuperAdmin || permissions.includes("Napp.View");
  const isNappEnabled = softwareEnabled.napp && hasNappPermission;
  const showMaintenance = isMaintenance || isError;

  if (isLoading || !authorizationLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.red} />
      </View>
    );
  }

  if (showMaintenance) {
    return (
      <View style={styles.center}>
        <MaintenanceModal show />
      </View>
    );
  }

  if (!isNappEnabled) {
    return (
      <View style={[styles.center, styles.padded]}>
        <Ionicons name="lock-closed-outline" size={48} color={colors.white} />
        <Text style={styles.message}>{t("napp_not_active")}</Text>
        <Button title={t("pages:logout")} variant="solid" onPress={logout} loading={loggingOut} style={styles.button} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.loginBg },
  padded: { padding: 24, gap: 16 },
  message: { color: colors.white, fontSize: 16, textAlign: "center" },
  button: { minWidth: 160 },
});
