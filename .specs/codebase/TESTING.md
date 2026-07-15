# Testing

## Status: No Test Infrastructure

This project has **zero automated tests**. No test runner, no test files, no test configuration.

## What Could Be Tested

### Unit Test Candidates
- `src/themes.ts` — Pure functions: `hexToHsl`, `hslToHex`, `adjustAccentBrightness`, `generateWindowTheme`
- `src/store/sessionStore.ts` — Zustand store logic: session add/remove/rename, activity signal mapping
- `electron/ptyManager.ts` — PTY lifecycle (mock node-pty)
- `electron/updater.ts` — Version comparison (`compareVersions`)
- `electron/remoteServer.ts` — PIN generation, rate limiting, auth middleware

### Integration Test Candidates
- IPC handler round-trips (main ↔ renderer)
- Config file load/save/change detection
- Session create/kill/restart lifecycle
- Workspace CRUD operations
- CLI socket communication

### E2E Test Candidates
- App launch with/without project path
- Window creation and focus
- Session creation, switching, closing
- Keyboard shortcuts
- Dashboard state updates
- Theme application
- Remote access setup flow

## CDP Debugging

Chrome DevTools Protocol enabled on port 9222 (`app.commandLine.appendSwitch('remote-debugging-port', '9222')`). This enables Playwright/Puppeteer to connect for E2E testing, though no scripts exist.

## Manual Testing Approach (Current)

The app appears to be tested manually. The `pnpm dev` script is the primary development workflow. No staging/preview environments are configured beyond the dev server.

## Recommendations

1. Add **Vitest** for unit/integration tests (same Vite ecosystem)
2. Add **Playwright** for E2E (CDP already enabled, Electron support built-in)
3. Start with pure-function unit tests (`themes.ts`, `sessionStore.ts`) for immediate value
4. Next: IPC handler integration tests with mocked PTY
5. Last: Cross-window E2E tests with real Electron

**No CI pipeline exists.** Any test infrastructure would need CI setup from scratch.
