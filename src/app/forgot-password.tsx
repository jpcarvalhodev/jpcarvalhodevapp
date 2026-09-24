import { useState } from "react";
import { StyleSheet } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { AuthShell } from "../components/AuthShell";
import { TextField } from "../components/Form";
import { Button } from "../components/Button";
import { fetchWithoutAuth } from "../api/http";
import { toast } from "../utils/toast";

const isEmailValid = (email: string): boolean =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email.toLowerCase(),
  );

export default function ForgotPasswordScreen() {
  const { t } = useTranslation("login");
  const [email, setEmail] = useState("");

  const returnToLogin = () => (router.canGoBack() ? router.back() : router.replace("/login"));

  const handleSubmit = async () => {
    if (!email) return;
    if (!isEmailValid(email)) {
      toast.error(t("please_valid_email"), { toastId: "forgot-invalid-email" });
      return;
    }

    try {
      const response = await fetchWithoutAuth(`Authentication/ForgotPassword?emailAddress=${email}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        toast.error(t("forgot_failed"), { toastId: "forgot-failed" });
        return;
      }

      toast.success(t("forgot_success"), { toastId: "forgot-success" });
      returnToLogin();
    } catch (error) {
      console.warn("Error:", error);
    }
  };

  return (
    <AuthShell centeredLogo onLogoPress={returnToLogin}>
      <TextField
        label={t("username")}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        returnKeyType="send"
        onSubmitEditing={handleSubmit}
      />
      <Button title={t("send")} onPress={handleSubmit} style={styles.submit} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  submit: { marginTop: 8 },
});
