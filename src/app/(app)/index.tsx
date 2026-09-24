import { useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSoftwareEnabledQuery } from "../../query/licenseQuery";
import { emptySoftwareEnabled } from "../../utils/softwareLicense";
import { useAuthUser } from "../../store/authStore";
import { getSessionValue, useLogout } from "../../hooks/useSession";
import { MODULE_CARDS, type ModuleCard } from "../../config/modules";
import { Button } from "../../components/Button";
import { toast } from "../../utils/toast";
import { colors } from "../../theme";
import logo from "../../../assets/jpcarvalhodev-logo.png";

// Port de ModuleChoice.tsx / ModuleChoice.scss
const GRID_PADDING = 12;

export default function ModuleChoiceScreen() {
  const { t } = useTranslation("components");
  const { width } = useWindowDimensions();
  const { permissions, flags } = useAuthUser();
  const { logout, loggingOut } = useLogout();
  const { data: softwareEnabled = emptySoftwareEnabled() } = useSoftwareEnabledQuery(getSessionValue("nif"));

  const cards = useMemo(() => {
    const hasModulePermission = (tab: string) =>
      flags.isSuperAdmin || permissions.includes(`${tab.charAt(0).toUpperCase()}${tab.slice(1)}.View`);

    return MODULE_CARDS.filter((c) => hasModulePermission(c.tab) && softwareEnabled[c.tab]);
  }, [softwareEnabled, flags.isSuperAdmin, permissions]);

  // Grid do card-container: 2 colunas, 3 a partir de 500
  const columns = width >= 500 ? 3 : 2;
  const gap = width >= 500 ? 5 : 12;
  const rows = useMemo(() => {
    const result: ModuleCard[][] = [];
    for (let i = 0; i < cards.length; i += columns) result.push(cards.slice(i, i + columns));
    return result;
  }, [cards, columns]);

  const handlePress = (card: ModuleCard) => {
    if (!card.route) {
      toast.info(t("mobile:module_not_available"), { toastId: "module-not-available" });
      return;
    }
    router.push(card.route);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.wrapper}>
        <View style={styles.formCard}>
          <View style={styles.logoSection}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.text}>
            {cards.length
              ? t("Selecione o módulo desejado para continuar")
              : t("Sem acesso aos modulos, verifique com o administrador do sistema")}
          </Text>
          <View style={[styles.grid, { gap }]}>
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={[styles.gridRow, { gap }]}>
                {row.map((item) => (
                  <Pressable
                    key={item.tab}
                    onPress={() => handlePress(item)}
                    style={({ pressed }) => [styles.moduleCard, pressed && styles.pressed, !item.route && styles.pending]}
                    accessibilityRole="button"
                    accessibilityLabel={t(item.titleKey)}
                  >
                    <Text style={styles.cardTitle}>{t(item.titleKey)}</Text>
                  </Pressable>
                ))}
                {Array.from({ length: columns - row.length }, (_, i) => (
                  <View key={`empty-${i}`} style={styles.emptyCell} />
                ))}
              </View>
            ))}
          </View>
          <Button title={t("pages:logout")} onPress={logout} loading={loggingOut} style={styles.logout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.loginBg },
  wrapper: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  formCard: {
    width: "100%",
    maxWidth: 520,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  logoSection: { alignItems: "center", marginBottom: 32 },
  logo: { width: 180, height: 60 },
  text: { textAlign: "center", color: colors.navy, fontSize: 13 },
  grid: {
    width: "90%",
    maxWidth: 420,
    alignSelf: "center",
    padding: GRID_PADDING,
  },
  gridRow: { flexDirection: "row" },
  emptyCell: { flex: 1 },
  moduleCard: {
    flex: 1,
    minHeight: 64,
    justifyContent: "center",
    padding: 5,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    backgroundColor: colors.white,
  },
  pressed: { opacity: 0.8 },
  pending: { opacity: 0.55 },
  cardTitle: {
    width: "100%",
    paddingHorizontal: 5,
    paddingTop: 5,
    paddingBottom: 10,
    textAlign: "center",
    fontSize: 12.8,
    fontWeight: "600",
    lineHeight: 15,
    color: colors.navy,
  },
  logout: { marginTop: 8 },
});
