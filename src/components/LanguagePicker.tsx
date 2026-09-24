import { useRef, useState } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "../theme";

const languageOptions = [
  { value: "pt", label: "PT" },
  { value: "en", label: "EN" },
  { value: "fr", label: "FR" },
  { value: "es", label: "ES" },
];

const ITEM_HEIGHT = 30;
const MENU_HEIGHT = ITEM_HEIGHT * languageOptions.length + 8;

export const LanguagePicker = () => {
  const { i18n } = useTranslation();
  const triggerRef = useRef<View>(null);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const current = (i18n.language ?? "pt").split("-")[0];
  const selected = languageOptions.find((l) => l.value === current) ?? languageOptions[0];

  const open = () => {
    triggerRef.current?.measureInWindow((x, y, _width, height) => {
      const below = y + height + 4;
      const fitsBelow = below + MENU_HEIGHT <= Dimensions.get("window").height - 8;
      setMenu({ x, y: fitsBelow ? below : Math.max(8, y - MENU_HEIGHT - 4) });
    });
  };

  return (
    <>
      <Pressable ref={triggerRef} onPress={open} style={styles.control} accessibilityRole="button" accessibilityLabel="Idioma">
        <Text style={styles.value}>{selected.label}</Text>
        <Ionicons name="chevron-down" size={14} color="#000" />
      </Pressable>
      <Modal visible={!!menu} transparent animationType="fade" onRequestClose={() => setMenu(null)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenu(null)}>
          {menu ? (
            <View style={[styles.menu, { left: menu.x, top: menu.y }]}>
              {languageOptions.map((l) => (
                <Pressable
                  key={l.value}
                  onPress={() => {
                    i18n.changeLanguage(l.value);
                    setMenu(null);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    l.value === selected.value && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                >
                  <Text style={[styles.optionText, l.value === selected.value && styles.optionTextSelected]}>
                    {l.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  control: {
    width: 70,
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  value: { fontSize: 12, color: colors.navy },
  menu: {
    position: "absolute",
    width: 70,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  option: { height: ITEM_HEIGHT, justifyContent: "center", paddingHorizontal: 8 },
  optionSelected: { backgroundColor: "#2684FF" },
  optionPressed: { backgroundColor: "#DEEBFF" },
  optionText: { fontSize: 12, color: colors.navy },
  optionTextSelected: { color: colors.white },
});
