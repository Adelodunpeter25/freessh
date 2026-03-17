# Expo Dev Client (Android) — SSH Module Setup

`@dylankenneally/react-native-ssh-sftp` is a native module, so it **will not work in Expo Go**. You must use a **custom dev client** (or a full native build).

## One‑Time Setup (Android)
1. Install dev client dependency:
   - `bun add expo-dev-client`
2. Generate native Android project (creates `android/`):
   - `npx expo prebuild -p android`
3. Build and install the dev client on your device/emulator:
   - `npx expo run:android`

## Daily Development (Android)
1. Start Metro:
   - `bun run android` (or `npx expo start`)
2. Open the installed **custom dev client** app on your device.
3. It should connect to Metro and load the app.

## Common Issues
- If you still see `Cannot read property 'connectToHostByPassword' of null`,
  you’re running in Expo Go or an old dev client build.
- Rebuild the dev client after adding/updating native modules:
  - `npx expo run:android`

