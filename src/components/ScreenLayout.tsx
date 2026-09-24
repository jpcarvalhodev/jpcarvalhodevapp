import type { ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { AppHeader } from "./AppHeader";
import { colors } from "../theme";

type Props = {
  children: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export const ScreenLayout = ({ children, onRefresh, refreshing = false }: Props) => (
  <View style={styles.root}>
    <AppHeader />
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
    >
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, alignItems: "center" },
  inner: { width: "100%", maxWidth: 520 },
});
