# AGENTS.md - FreeSSH Development Guide

## Overview

FreeSSH has two implementations:
- **Desktop**: Electron + React + Go backend
- **Mobile**: React Native (Expo) + SSH library

### Desktop
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend**: Go 1.25
- **State**: Zustand
- **Terminal**: xterm.js

### Mobile
- **Framework**: Expo SDK 54, React Native 0.81.5
- **UI**: Tamagui, Lucide icons
- **Navigation**: React Navigation 7 (bottom tabs + native stack)
- **SSH/SFTP**: `@dylankenneally/react-native-ssh-sftp`
- **Storage**: AsyncStorage + Expo SQLite
- **Terminal**: WebView + xterm.js

## Build Commands

### Frontend
```bash
bun run dev          # Development
bun run build        # Production build
bun run start        # Preview production
bun run build:icons  # Build icons
```

### Backend (Go)
```bash
cd backend && go build -o bin/server ./cmd/server
# Or: bun run build:backend
```

### Full Build
```bash
bun run build:mac    # Build macOS app
```

### Mobile (Expo/React Native)
```bash
cd mobile
bun start            # Start Expo
bun run dev:android  # Run on Android
bun run ios          # Run on iOS
bun run web          # Run web
```

### Testing
Manual testing only:
1. Run `bun run dev` (desktop) or `cd mobile && bun start` (mobile)
2. Connect to a test SSH server
3. Verify functionality works

## Project Structure

```
freessh/
├── src/
│   ├── main/           # Electron main process
│   ├── preload/        # Preload scripts
│   └── renderer/src/  # React frontend
│       ├── components/, hooks/, pages/, services/, stores/, types/, lib/
├── backend/
│   ├── cmd/server/    # Entry point
│   └── internal/      # Packages: ipc, session, sftp, portforward
├── mobile/           # React Native (Expo)
│   └── src/
│       ├── components/, screens/, services/, stores/, hooks/, utils/
│       └── services/ssh/   # SSH service wrapper
└── resources/        # App icons
```

## Code Style Guidelines

### TypeScript/React
- Functional components with hooks
- Prefer `const` over `let`
- Avoid `any` unless necessary
- Use meaningful names, keep components small

**Imports**: use path aliases `@/` or `@renderer/`
**Components**: One per file, named export, Props interface above, destructure props
**Hooks**: Prefix with `use`, single responsibility, return objects
**Zustand**: One store per domain, flat/simple, use selectors

### Go Backend
- Standard Go conventions, `gofmt` formatting
- Handle errors explicitly - don't panic
- Wrap errors: `fmt.Errorf("context: %w", err)`
- Document exported functions

### Tailwind CSS (Desktop)
- Use `cn()` utility from `lib/utils.ts` for conditional classes

### Mobile (React Native/Tamagui)
- Use Tamagui components instead of Radix UI
- Use `Stack`, `Text`, `YStack` from tamagui for layouts
- Use Lucide icons via `lucide-react-native`
- React Navigation 7 with bottom tabs + native stack
- Zustand stores work the same as desktop
- Terminal uses WebView with embedded xterm.js

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ConnectionsPage.tsx` |
| Hooks | camelCase + `use` | `useConnections.ts` |
| Stores | camelCase + `Store` | `connectionStore.ts` |
| Types | PascalCase | `ConnectionConfig` |
| Functions | camelCase | `loadConnections()` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |

## Error Handling

**Frontend**:
```typescript
try {
  await connectionService.connect(config)
  toast.success('Connected')
} catch (err) {
  toast.error(err instanceof Error ? err.message : 'Failed')
}
```

**Backend**: Return errors, don't panic, wrap with context, log to stderr

## Security
- Never commit secrets/credentials
- Validate IPC inputs
- Sanitize user input
- Handle SSH host keys properly

## Git Commit Guidelines
- **Single-line commit messages**
- Imperative mood: "Add feature" not "Added"
- Max 72 chars, no period
- Commit after every task

```bash
git commit -m "Add SSH key file selection dialog"
git commit -m "Fix SFTP upload progress reporting"
```

## Branch Strategy
- `feature/description`, `fix/description`, `refactor/description`

## Before Committing
1. Run `bun run build` to verify build
2. Manual test changed functionality
3. Check console for errors
4. Verify no regressions
