import type { Ionicons } from "@expo/vector-icons";

type IconName = keyof typeof Ionicons.glyphMap;

export type NavItem = {
  key: string;
  labelKey: string;
  icon: IconName;
  permissions?: string[];
} &
  (| { route: string }
    | { href: "/" }
    | { webPath: string }
  );

export type NavBottomConfig = {
  items: NavItem[];
  more?: { labelKey: string; icon: IconName; items: NavItem[] };
};

export const NAV_BOTTOM_PRESETS: Record<string, NavBottomConfig> = {
  devclock: {
    items: [
      {
        key: "attendances",
        labelKey: "attendances",
        icon: "time-outline",
        route: "dashboard",
        permissions: ["Nclock.View", "Nclock.AttendanceTimes.View"],
      },
      {
        key: "requests",
        labelKey: "requests",
        icon: "swap-horizontal-outline",
        route: "requests",
        permissions: ["Nclock.View", "Nclock.Requests.View"],
      },
      {
        key: "presence",
        labelKey: "presence",
        icon: "people-outline",
        route: "presence",
        permissions: ["Nclock.View", "Nclock.Presence.View"],
      },
      {
        key: "absences",
        labelKey: "absences",
        icon: "medkit-outline",
        route: "absences",
        permissions: ["Nclock.View", "Nclock.Absences.View"],
      },
      {
        key: "vacation",
        labelKey: "vacation",
        icon: "umbrella-outline",
        route: "vacation",
        permissions: ["Nclock.View", "Nclock.Vacations.View"],
      },
    ],
  },
  devaccess: {
    items: [
      {
        key: "access",
        labelKey: "access",
        icon: "exit-outline",
        route: "dashboard",
        permissions: ["Naccess.View", "Naccess.Transactions.View"],
      },
      {
        key: "presence",
        labelKey: "presence",
        icon: "people-outline",
        route: "presence",
        permissions: ["Naccess.View", "Naccess.Presence.View"],
      },
      {
        key: "doors",
        labelKey: "doors",
        icon: "key-outline",
        route: "door",
        permissions: ["Naccess.View", "Naccess.OpenDoor"],
      },
      {
        key: "panel",
        labelKey: "panel",
        icon: "desktop-outline",
        route: "panel",
        permissions: ["Naccess.View", "Naccess.Transactions.View"],
      },
    ],
  },
};
