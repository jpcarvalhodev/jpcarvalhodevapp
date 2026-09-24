import { Tabs } from "expo-router";
import { ModuleTabBar } from "../../../components/ModuleTabBar";
import { NAV_BOTTOM_PRESETS } from "../../../config/navBottomPresets";

export default function DevaccessLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <ModuleTabBar {...props} config={NAV_BOTTOM_PRESETS.devaccess} />}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="presence" />
      <Tabs.Screen name="door" />
      <Tabs.Screen name="panel" />
    </Tabs>
  );
}
