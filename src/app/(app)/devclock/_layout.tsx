import { Tabs } from "expo-router";
import { ModuleTabBar } from "../../../components/ModuleTabBar";
import { NAV_BOTTOM_PRESETS } from "../../../config/navBottomPresets";

export default function DevclockLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <ModuleTabBar {...props} config={NAV_BOTTOM_PRESETS.devclock} />}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="requests" />
      <Tabs.Screen name="absences" />
      <Tabs.Screen name="vacation" />
      <Tabs.Screen name="presence" />
    </Tabs>
  );
}
