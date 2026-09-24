import type { ReactNode } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { version } from "../api/apiService";
import { CustomSpinnerLogin } from "./CustomSpinnerLogin";
import { colors } from "../theme";
import logo from "../../assets/jpcarvalhodev-logo.png";

type Props = {
  children: ReactNode;
  headerRight?: ReactNode;
  centeredLogo?: boolean;
  onLogoPress?: () => void;
  busy?: boolean;
};

export const AuthShell = ({
  children,
  headerRight,
  centeredLogo,
  onLogoPress,
  busy,
}: Props) => {
  const { t } = useTranslation("login");

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View
              style={[
                styles.cardHeader,
                centeredLogo && styles.cardHeaderCentered,
              ]}
            >
              <Pressable
                style={styles.logoSection}
                onPress={onLogoPress}
                disabled={!onLogoPress}
              >
                <Image source={logo} style={styles.logo} resizeMode="contain" />
              </Pressable>
              {headerRight}
            </View>
            {children}
            {busy ? (
              <View style={styles.overlay}>
                <CustomSpinnerLogin />
              </View>
            ) : null}
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()}{" "}
              <Text style={styles.footerText}>jpcarvalhodev</Text>
            </Text>
            <Text style={styles.footerText}>{version}</Text>
            <Text style={styles.footerText}>
              {t(
                "Ao iniciar a sessão, está a aceitar os termos e condições, política de privacidade e cookies",
              )}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.loginBg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 12 },
  card: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardHeaderCentered: { justifyContent: "center" },
  logoSection: { flexDirection: "row", alignItems: "center", marginBottom: 32 },
  logo: { width: 180, height: 70 },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    paddingTop: 50,
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
  },
  footerText: {
    color: "rgb(133,133,133)",
    fontSize: 12.8,
    textAlign: "center",
  },
});
