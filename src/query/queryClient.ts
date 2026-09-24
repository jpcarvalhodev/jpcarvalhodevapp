import { AppState, Platform } from "react-native";
import { QueryClient, focusManager } from "@tanstack/react-query";

focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener("change", (status) => {
    if (Platform.OS !== "web") handleFocus(status === "active");
  });
  return () => sub.remove();
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: 1,
    },
  },
});
