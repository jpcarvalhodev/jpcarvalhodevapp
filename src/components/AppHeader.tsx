import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLogout, useUserPhoto } from "../hooks/useSession";
import { colors, radius } from "../theme";

import logo from "../../assets/jpcarvalhodev-logo-white-accent.png";
import defaultAvatar from "../assets/img/navbar/modalAvatar.png";

export const AppHeader = () => {
  const { t } = useTranslation("pages");
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const photo = useUserPhoto();
  const { logout } = useLogout();

  const go = (fn: () => void) => {
    setMenuOpen(false);
    fn();
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
      <View style={styles.left}>
        <View>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
      </View>
      <Pressable
        style={styles.right}
        onPress={() => setMenuOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Menu"
        hitSlop={8}
      >
        <Image source={photo ? { uri: photo } : defaultAvatar} style={styles.avatar} />
        <Ionicons name="chevron-down" size={18} color={colors.white} />
      </Pressable>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={[styles.dropdown, { top: 56 + insets.top }]}>
            <MenuItem icon="person-outline" label={t("profile")} onPress={() => go(() => router.push("/profile"))} />
            <MenuItem
              icon="apps-outline"
              label={t("components:modulos")}
              onPress={() => go(() => router.dismissTo("/"))}
            />
            <MenuItem icon="log-out-outline" label={t("logout")} danger onPress={() => go(() => void logout())} />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
};

const MenuItem = ({ icon, label, onPress, danger }: MenuItemProps) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
    <Ionicons name={icon} size={20} color={danger ? colors.red : colors.navy} />
    <Text style={[styles.itemText, danger && { color: colors.red }]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.dark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 150, height: 28 },
  right: { flexDirection: "row", alignItems: "center", gap: 6 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.white },
  backdrop: { flex: 1 },
  dropdown: {
    position: "absolute",
    right: 8,
    minWidth: 200,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  item: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  itemPressed: { backgroundColor: colors.bg },
  itemText: { fontSize: 15, color: colors.navy },
});
