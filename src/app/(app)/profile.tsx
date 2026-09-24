import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useRegisteredUsersQuery, useUpdateRegisteredUserMutation } from "../../query/personsQuery";
import { useAuthUser } from "../../store/authStore";
import { getSessionValue, useUserPhoto } from "../../hooks/useSession";
import { ScreenLayout } from "../../components/ScreenLayout";
import { UpdateUserPasswordModal } from "../../modals/UpdateUserPasswordModal";
import { formatDateTimeDDMMYYYYHHmm } from "../../utils/dateUtils";
import { EMPTY_ARRAY } from "../../utils/emptyArray";
import { colors, radius, shadow } from "../../theme";

const defaultAvatar = require("../../assets/img/navbar/modalAvatar.png");

// Port de Profile.tsx. "Obter QR Code" e notificações push ficam para uma fase seguinte.
export default function ProfileScreen() {
  const { t } = useTranslation("pages");
  const insets = useSafeAreaInsets();
  const { claims } = useAuthUser();
  const [openModal, setOpenModal] = useState(false);
  const photo = useUserPhoto();
  const { data: registeredUsers = EMPTY_ARRAY } = useRegisteredUsersQuery();
  const updateRegisteredUser = useUpdateRegisteredUserMutation();

  const lastLogin = typeof claims?.nbf === "number" ? formatDateTimeDDMMYYYYHHmm(new Date(claims.nbf * 1000)) : "--";

  const userForPasswordChange = useMemo(() => {
    const username = getSessionValue("username");
    if (!username) return null;
    return registeredUsers.find((u) => u.userName === username) ?? null;
  }, [registeredUsers]);

  return (
    <View style={styles.root}>
      <ScreenLayout>
        <View style={[styles.card, shadow]}>
          <View style={styles.banner} />
          <View style={styles.body}>
            <View style={styles.avatarRing}>
              <Image source={photo ? { uri: photo } : defaultAvatar} style={styles.avatar} />
            </View>
            <Text style={styles.name}>{claims?.employee_name ?? ""}</Text>
            <View style={styles.badges}>
              {claims?.enroll_number != null ? (
                <Text style={styles.badge}>Nº {String(claims.enroll_number)}</Text>
              ) : null}
              {claims?.role ? <Text style={styles.badge}>{String(claims.role)}</Text> : null}
            </View>
            <View style={styles.stat}>
              <Ionicons name="log-in-outline" size={22} color={colors.dark} />
              <Text style={styles.statTitle}>{t("ÚLTIMO LOGIN")}</Text>
              <Text style={styles.statValue}>{lastLogin}</Text>
            </View>
            <Pressable style={styles.action} onPress={() => setOpenModal(true)}>
              <Text style={styles.actionText}>{t("ALTERAR PASSWORD")}</Text>
            </Pressable>
          </View>
        </View>
      </ScreenLayout>
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 6 }]}>
        <NavButton icon="arrow-back" label={t("voltar")} onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
        <NavButton icon="apps-outline" label={t("components:modulos")} onPress={() => router.dismissTo("/")} />
      </View>
      <UpdateUserPasswordModal
        title="Alterar Password"
        open={openModal}
        onClose={() => setOpenModal(false)}
        onUpdate={async (data) => {
          await updateRegisteredUser.mutateAsync(data);
        }}
        entity={userForPasswordChange}
      />
    </View>
  );
}

const NavButton = ({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) => (
  <Pressable style={styles.navItem} onPress={onPress} accessibilityRole="button">
    <Ionicons name={icon} size={20} color={colors.muted2} />
    <Text style={styles.navText}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: "hidden" },
  banner: { height: 90, backgroundColor: colors.dark },
  body: { alignItems: "center", paddingHorizontal: 16, paddingBottom: 20 },
  avatarRing: {
    marginTop: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.white,
    overflow: "hidden",
    backgroundColor: colors.bg,
  },
  avatar: { width: "100%", height: "100%" },
  name: { marginTop: 10, fontSize: 20, fontWeight: "800", color: colors.dark, textAlign: "center" },
  badges: { flexDirection: "row", gap: 8, marginTop: 8 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#ccc",
    color: colors.dark,
    fontWeight: "700",
    overflow: "hidden",
  },
  stat: {
    marginTop: 18,
    alignSelf: "stretch",
    alignItems: "center",
    gap: 4,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.rowBorder,
  },
  statTitle: { fontSize: 12, fontWeight: "700", color: colors.muted },
  statValue: { fontSize: 16, fontWeight: "700", color: colors.dark },
  action: {
    marginTop: 14,
    alignSelf: "stretch",
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.dark,
    alignItems: "center",
  },
  actionText: { color: colors.white, fontWeight: "800" },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: colors.white,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  navItem: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 4 },
  navText: { fontSize: 11, color: colors.muted2 },
});
