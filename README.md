# Devapp

A mobile app for iOS and Android built with React Native and Expo. It covers time and attendance (Devclock) and access control (Devaccess), with multi-language support.

## Features

- **Authentication**: login with JWT, automatic token refresh, progressive lockout after repeated failed attempts, and password recovery.
- **Devclock (attendance)**: dashboard, presence, attendance requests, absences and vacations, with clock-in using the device location and signature capture.
- **Devaccess (access control)**: dashboard, live panel, presence and manual door opening.
- **Permissions**: every screen is guarded by role and permission checks.
- **Languages**: Portuguese, English, Spanish and French, following the device language.

## Tech stack

Expo SDK 57, React Native 0.86, React 19, TypeScript, Expo Router, TanStack Query, Zustand, i18next, date-fns.

## Getting started

Requirements: Node.js and npm, plus [Expo Go](https://expo.dev/go) on a phone or an iOS/Android emulator.

```bash
npm install
```

Create a `.env` file in the project root with the address of your backend:

```
EXPO_PUBLIC_API_BASE=http://localhost:9999/api/
EXPO_PUBLIC_API_TICKETS=http://localhost:9999/
```

Then start the app and scan the QR code with Expo Go:

```bash
npm start
```

Restart Expo after changing `.env`.

> **Note:** the app needs a compatible REST backend to sign in and load data. The backend is not part of this repository.

## Scripts

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `npm start`         | Start the Expo dev server     |
| `npm run android`   | Start and open on Android     |
| `npm run ios`       | Start and open on iOS         |
| `npm run typecheck` | Type-check with TypeScript    |
| `npm run lint`      | Lint with ESLint              |

## Project structure

```
src/
├── app/          # Expo Router screens (login, module choice, devclock, devaccess)
├── api/          # API client and request functions
├── components/   # Shared UI components
├── modals/       # Form modals
├── query/        # React Query hooks
├── store/        # Zustand stores
├── locales/      # Translations (pt, en, es, fr)
└── utils/        # Helpers
```

See [CLAUDE.md](CLAUDE.md) for a more detailed architecture guide.

## License

Released under the [MIT License](LICENSE).
