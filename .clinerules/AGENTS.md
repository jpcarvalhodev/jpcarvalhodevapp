# AGENTS.md

This file provides guidance to agents working with code in this repository.

## Overview

Devapp is a **React Native app (Expo SDK 57 + Expo Router)** for iOS and Android, ported from an earlier Vite web app. Scope is intentionally small: **base (login, module choice, profile) + Devclock (attendance) + Devaccess (access control)**. Do not port other modules unless asked.

The app talks to an existing REST backend; permissions, response fields and license keys are backend contracts (see "Backend contracts").

## Quick Start

```bash
npm install
npm start            # expo start (scan QR with Expo Go)
npm run android      # expo start --android
npm run ios          # expo start --ios
npm run typecheck    # tsc --noEmit
npm run lint         # expo lint
```

No test framework is configured.

Create a `.env` at the repo root (gitignored, so it is never committed):

```
EXPO_PUBLIC_API_BASE=<main REST API base url>
EXPO_PUBLIC_API_TICKETS=<ticketing API base url>
```

Read in `src/api/config.ts` as `BASE_URL` and `baseURL`. Restart Expo after changing `.env`.

## Tech Stack

| Layer         | Technology                                              |
| ------------- | ------------------------------------------------------- |
| Framework     | React 19 + React Native 0.86 + Expo ~57                 |
| Language      | TypeScript ~6.0 (strict)                                |
| Routing       | expo-router ~57 (file-based, typed routes)              |
| State         | Zustand v5                                              |
| Data fetching | @tanstack/react-query v5                                |
| i18n          | i18next + react-i18next + expo-localization             |
| Storage       | expo-sqlite `kv-store` (`src/utils/storage.ts`)         |
| Auth          | JWT (`jwt-decode`), in-memory access token + refresh    |
| Dates         | date-fns + @react-native-community/datetimepicker       |
| Maps          | Leaflet inside `react-native-webview`                   |
| Signature     | react-native-signature-canvas                           |
| Icons         | @expo/vector-icons (Ionicons)                           |
| Location      | expo-location                                           |

Path alias `@/*` → `src/*` is configured in `tsconfig.json`, but existing code uses relative imports; match that.

## Project Structure

```
src/
├── app/                        # Expo Router routes (file = screen)
│   ├── _layout.tsx             # Root: providers, splash, auth-guarded Stack
│   ├── login.tsx, forgot-password.tsx   # Public screens
│   └── (app)/                  # Authenticated area
│       ├── _layout.tsx         # Validates Devapp license + permission before any module
│       ├── index.tsx           # Module choice (cards from config/modules.ts)
│       ├── profile.tsx
│       ├── devclock/           # Attendance: dashboard, presence, requests, absences, vacation
│       └── devaccess/          # Access control: dashboard, panel, presence, door
├── api/
│   ├── apiService.ts           # All REST calls
│   ├── http.ts                 # fetchWithAuth / fetchWithoutAuth, token refresh, error logging
│   └── config.ts               # BASE_URL / baseURL from EXPO_PUBLIC_* env vars
├── auth/accessToken.ts         # In-memory access token holder
├── components/                 # Shared UI (AppModal, Button, Form, SelectField, DateTimeField,
│                               #   ModuleTabBar, LeafletMap, SignaturePad, ToastHost, ...)
├── config/
│   ├── modules.ts              # MODULE_CARDS (module choice screen)
│   └── navBottomPresets.ts     # Bottom tab config per module (NAV_BOTTOM_PRESETS)
├── hooks/useSession.ts         # Logout, session values, user photo
├── locales/                    # i18n: en/ pt/ es/ fr/ (8 namespaces each)
├── modals/                     # CRUD modals built on components/AppModal
├── query/                      # React Query hooks (attendance, license, persons, terminal)
├── store/                      # Zustand stores (auth, data, maintenance)
├── types/Types.ts              # Shared types
├── utils/                      # dateUtils, calendar, dashboardUtils, softwareLicense, storage, text, toast, emptyArray
├── theme.ts                    # colors, radius, shadow
├── i18n.ts                     # i18next setup
└── declarations.d.ts
assets/                         # App icons and logos (referenced by app.json)
```

## Routing

- File-based via Expo Router in `src/app/`. `typedRoutes` is enabled.
- Root `_layout.tsx` uses `Stack.Protected`: authenticated users see `(app)`, others see `login` / `forgot-password`.
- Each module folder has a `_layout.tsx` rendering a `Tabs` navigator with `ModuleTabBar`, configured by `NAV_BOTTOM_PRESETS.<module>` in `src/config/navBottomPresets.ts`.
- Each screen wraps its content in `RequirePermissions` (from `components/RequirePermissions.tsx`) with the required permission strings.
- Route folders use the Dev* names (`devclock`, `devaccess`); `MODULE_CARDS` links to `/devclock/dashboard` and `/devaccess/dashboard`.

## State Management (Zustand v5)

| Store            | File                      | Key state                                                                                       |
| ---------------- | ------------------------- | ----------------------------------------------------------------------------------------------- |
| authStore        | `store/authStore.ts`      | token, claims, role, permissions, flags, bootstrapping; login rate-limiting (3 failures → progressive lock); refresh + logout reasons (`expired`, `session-replaced`) |
| dataStore        | `store/dataStore.ts`      | geoLocation, start/end dates, selected employees                                                |
| maintenanceStore | `store/maintenanceStore.ts` | failure counter that flags maintenance mode after repeated failures                           |

Selector hooks: `useAuthToken`, `useAuthData`, `useAuthUser`, `useAuthActions`, `useLoginLockState`, `useGeoLocation`, `useGeoActions`, `useAttendanceFilters`. `initAuthStore()` is called once from the root layout. A small toast store lives in `utils/toast.ts` (`toast.success/error/warn/info`, rendered by `ToastHost`).

## Data Fetching

- `query/queryHooks.ts`: `useStoreQuery`, `useStoreMutation` wrappers (mutations auto-toast and invalidate keys) and `toRowsData` to normalise list payloads.
- `query/queryClient.ts`: shared `QueryClient`; React Query focus is wired to `AppState`.
- Domain hooks: `attendanceQuery`, `licenseQuery`, `personsQuery`, `terminalQuery`.
- API functions live in `api/apiService.ts`; all calls go through `fetchWithAuth` / `fetchWithoutAuth` in `api/http.ts`.

## Auth & HTTP

- Access token is kept in memory (`auth/accessToken.ts`); the refresh token is a cookie (`credentials: "include"`).
- `fetchWithAuth` adds `Authorization: Bearer` and `Accept-Language`, retries once after a successful refresh on 401, honours `session-replaced`, and records failures for the maintenance store (5xx).
- Concurrent refreshes share one promise (`refreshAccessToken`).
- Logout goes through `useLogout` in `hooks/useSession.ts` (calls `Authentication/Logout`, clears the query cache).

## Backend contracts (do not rename)

These strings come from or go to the API and must stay as-is even though UI/code names are Dev*:

- Permissions: `Nclock.*`, `Naccess.*`, `Napp.View`.
- Response fields such as `nclockData`, `nclockPedidos`.
- License keys in `utils/softwareLicense.ts` and `SoftwareProduct` in `types/Types.ts` (`nclock`, `naccess`, `napp`, ...), and the `tab` value in `config/modules.ts`, which indexes them.
- The i18n key `napp_not_active` in `components.json`.

Only the app side was renamed (routes, components, images, i18n text). Rename the backend contract only if the backend is renamed too.

## i18n

- Languages: `pt` (fallback), `en`, `es`, `fr`. Detection: stored `i18nextLng` (via `storage`) → device locale → `pt`.
- Namespaces (8): `login` (default), `api`, `pages`, `components`, `modals`, `stores`, `fields`, `mobile`.
- All resources are statically imported in `src/i18n.ts` (no lazy backend); `useSuspense: false`.
- Keys: `useTranslation("<ns>")` then `t("key")`, or `t("<ns>:key")`.
- Add a key to all four languages. Some keys are built dynamically (e.g. `components:${status}` in `http.ts`), so check usage before deleting keys.

## Modals

`components/AppModal.tsx` is the shared centered modal (fade animation, header, scrollable body, footer). CRUD modals in `src/modals/` build on it and follow the pattern `export const XModal = (props) => (props.open ? <XForm {...props} /> : null)` so form state resets on every open. Current modals: `CreateModalAccess`, `CreateModalAttendanceAbsence`, `CreateModalAttendanceRequests`, `CreateModalAttendanceVacation`, `CreateModalSignatureAttendance`, `ManualOpenDoorModal`, `UpdateUserPasswordModal`. Shared helpers in `modals/formHelpers.ts`.

## App Config

- `app.json`: name/slug/scheme, bundle id (iOS) and package (Android), icons, splash, and plugins (`expo-router`, `expo-sqlite`, `expo-location`, `expo-localization`, `datetimepicker`, `expo-splash-screen`, `expo-font`).
- Location permission strings are in `app.json` (used for attendance clock-in).
- The app is tested on device with Expo Go.

## Code Conventions

- **Screens:** one file per screen in `src/app/(app)/<module>/`; default export is a `*Screen` component that wraps the page in `RequirePermissions`.
- **Naming:** PascalCase components, camelCase hooks/utils, kebab-case route files where multiple words (`forgot-password.tsx`).
- **Styling:** `StyleSheet.create` with tokens from `src/theme.ts`; no SCSS/Bootstrap.
- **Imports:** relative paths; no barrel files.
- **Server data:** through query hooks, never `fetch` directly in screens.
- **Text:** all user-visible strings through i18n.

## Adding a New Feature (Workflow)

1. API function in `src/api/apiService.ts` (+ types in `src/types/Types.ts`).
2. Query/mutation hook in `src/query/` using `useStoreQuery` / `useStoreMutation`.
3. Screen in `src/app/(app)/<module>/<screen>.tsx` wrapped in `RequirePermissions`.
4. Register the tab in `NAV_BOTTOM_PRESETS`; for a new module also add a `_layout.tsx` and a `MODULE_CARDS` entry.
5. i18n keys in all four `src/locales/<lang>/<namespace>.json`.
6. Modal (if CRUD) in `src/modals/` on top of `AppModal`.
7. Run `npm run typecheck`.
