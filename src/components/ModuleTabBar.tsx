import { useState } from "react";
import { Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import type { BottomTabBarProps } from "expo-router/tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { NavBottomConfig, NavItem } from "../config/navBottomPresets";
import { hasPermissions, useAuthUser } from "../store/authStore";
import { baseURL } from "../api/apiService";
import { colors, radius } from "../theme";

type Props = BottomTabBarProps & { config: NavBottomConfig };

export const ModuleTabBar = ({ state, navigation, config }: Props) => {
  const { t } = useTranslation("components");
  const insets = useSafeAreaInsets();
  const { permissions, flags } = useAuthUser();
  const [moreOpen, setMoreOpen] = useState(false);
  const activeRoute = state.routes[state.index]?.name;

  const isDisabled = (item: NavItem) => !hasPermissions(permissions, flags, item.permissions);
  const isActive = (item: NavItem) => "route" in item && item.route === activeRoute;

  const handlePress = (item: NavItem) => {
    if (isDisabled(item)) return;
    setMoreOpen(false);
    if ("route" in item) navigation.navigate(item.route);
    else if ("href" in item) router.dismissTo(item.href);
    else Linking.openURL(`${baseURL.replace(/\/+$/, "")}/${item.webPath}`);
  };

  const moreActive = !!config.more?.items.some(isActive);

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 6 }]}>
      {config.items.map((item) => (
        <TabButton
          key={item.key}
          icon={item.icon}
          label={t(item.labelKey)}
          active={isActive(item)}
          disabled={isDisabled(item)}
          onPress={() => handlePress(item)}
        />
      ))}
      {config.more ? (
        <TabButton
          icon={config.more.icon}
          label={t(config.more.labelKey)}
          active={moreActive}
          onPress={() => setMoreOpen(true)}
        />
      ) : null}

      <Modal visible={moreOpen} transparent animationType="fade" onRequestClose={() => setMoreOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMoreOpen(false)}>
          <View style={[styles.moreMenu, { bottom: 80 + insets.bottom }]}>
            {config.more?.items.map((item) => {
              const disabled = isDisabled(item);
              return (
                <Pressable
                  key={item.key}
                  onPress={() => handlePress(item)}
                  disabled={disabled}
                  style={({ pressed }) => [styles.moreItem, pressed && styles.morePressed, disabled && styles.disabled]}
                  accessibilityRole="menuitem"
                >
                  <Ionicons name={item.icon} size={20} color={isActive(item) ? colors.dark : colors.muted2} />
                  <Text style={[styles.moreText, isActive(item) && styles.activeText]}>{t(item.labelKey)}</Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

type TabButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
};

const TabButton = ({ icon, label, active, disabled, onPress }: TabButtonProps) => (
  <Pressable
    style={[styles.item, disabled && styles.disabled]}
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="tab"
    accessibilityState={{ selected: active, disabled: !!disabled }}
  >
    <Ionicons name={icon} size={active ? 22 : 20} color={active ? colors.dark : colors.muted2} />
    <Text style={[styles.text, active && styles.activeText]} numberOfLines={1}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.white,
    paddingTop: 8,
    paddingHorizontal: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 4 },
  text: { fontSize: 11, color: colors.muted2 },
  activeText: { color: colors.dark, fontWeight: "700" },
  disabled: { opacity: 0.4 },
  backdrop: { flex: 1 },
  moreMenu: {
    position: "absolute",
    right: 8,
    minWidth: 200,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  moreItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  morePressed: { backgroundColor: colors.bg },
  moreText: { fontSize: 14, color: colors.muted2 },
});
