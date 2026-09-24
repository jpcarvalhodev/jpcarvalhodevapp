import { Modal, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors, radius } from "../theme";

type Props = {
  show: boolean;
};

export const MaintenanceModal = ({ show }: Props) => {
  const { t } = useTranslation("login");

  return (
    <Modal visible={show} transparent animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Ionicons name="construct-outline" size={40} color="#555555" style={styles.icon} />
          <Text style={styles.title}>{t("maintenance_title")}</Text>
          <Text style={styles.message}>{t("maintenance_message")}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
  card: { backgroundColor: colors.white, borderRadius: radius.md, paddingVertical: 40, paddingHorizontal: 32 },
  icon: { alignSelf: "center", marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700", color: colors.navy, textAlign: "center", marginBottom: 8 },
  message: { fontSize: 14, color: "#666666", textAlign: "left" },
});
