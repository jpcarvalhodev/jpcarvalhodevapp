import "../i18n";
import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { queryClient } from "../query/queryClient";
import { initAuthStore, useAuthUser } from "../store/authStore";
import { ToastHost } from "../components/ToastHost";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { isAuthenticated, isBootstrapping } = useAuthUser();

  useEffect(() => initAuthStore(), []);

  useEffect(() => {
    if (!isBootstrapping) SplashScreen.hideAsync().catch(() => {});
  }, [isBootstrapping]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={isAuthenticated}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>
          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen name="login" />
            <Stack.Screen name="forgot-password" />
          </Stack.Protected>
        </Stack>
        <ToastHost />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
