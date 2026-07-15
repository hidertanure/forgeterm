# Stack

## Runtime
- **Platform:** Electron 30.x (desktop app, macOS-primary with cross-platform support)
- **Runtime:** Node.js (bundled with Electron)
- **Language:** TypeScript 5.2 (strict mode, no unused locals/params disabled)

## Frontend (Renderer)
- **Framework:** React 18.2 (with react-dom)
- **State management:** Zustand 5.0
- **Terminal:** @xterm/xterm 5.5 + addons (fit, search, web-links, webgl)
- **Markdown rendering:** react-markdown 10.1 + remark-gfm 4.0
- **QR code generation:** qrcode 1.5
- **Styling:** Plain CSS (App.css ~3600 lines, index.css ~34 lines) — no CSS-in-JS or Tailwind

## Backend (Main Process)
- **PTY:** node-pty 1.0 (native module, requires @electron/rebuild)
- **HTTP/WS:** express 5.2, ws 8.19 (for remote access)
- **Networking:** Node.js net module (Unix socket IPC for CLI)
- **Tunneling:** cloudflared (external binary, not bundled)
- **File system:** Node.js fs (config files, session persistence, history)
- **Child processes:** Node.js child_process (ps snapshots, git, CLI install)

## Build & Dev
- **Bundler:** Vite 5.1
- **Electron integration:** vite-plugin-electron 0.28 + vite-plugin-electron-renderer 0.14
- **Packaging:** electron-builder 24.13
- **Package manager:** pnpm (workspace, pnpm-lock.yaml)
- **Patches:** dmg-builder patch

## Testing
- **No test runner configured.** No jest, vitest, playwright, or cypress.
- CDP remote debugging enabled on port 9222 (for Playwright). No tests exist.

## Path Alias
- `@shared` → `shared/` (configured in vite.config.ts)

## Key Omissions
- No linting (ESLint, Prettier)
- No type checking in CI — `tsc` runs as part of build script but isn't enforced separately
- No IPC validation/schema (types only)
- No logging framework (console.log scattered)
- No error monitoring/bug reporting
