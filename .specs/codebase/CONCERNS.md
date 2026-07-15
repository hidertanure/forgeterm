# Concerns

## Risk Areas

### 1. main.ts Monolith (3088 lines)
**Risk: HIGH**
The main process entry file is extremely large and handles too many concerns: app lifecycle, IPC handler setup (50+ handlers), window management, config loading/saving/watching, workspace CRUD, session persistence, Claude integration, tray/dock management, editor detection, import logic, CLI install, and menu building. Any change here has a large blast radius.

**Mitigation:** Extract concerns into separate modules. IPC handlers → `ipc/handlers.ts`, config → `config.ts`, workspaces → `workspaces.ts`, session persistence → `persistence.ts`.

### 2. No Automated Tests
**Risk: HIGH**
Zero test coverage across the entire codebase. The app is tested manually via `pnpm dev`. Breaking changes may go undetected until user reports.

**Mitigation:** Add Vitest for unit/integration tests. Prioritize pure functions (themes, store logic) first, then IPC handlers.

### 3. No Linting or Type Checking in CI
**Risk: MEDIUM**
`tsc` only runs as part of the build script. No standalone type check, no ESLint, no Prettier. Inconsistent code style possible. Type errors can accumulate between builds.

### 4. Session Persistence Reliability
**Risk: MEDIUM**
Session state persistence relies on debounced saves (800ms) and window close hooks. The `before-quit` handler is commented out. Force-quits or crashes lose up to 800ms of state changes. The conversation ID detection runs every 15 seconds and only for sessions without known IDs—a session created and quit within 15 seconds loses its conversation association.

### 5. Remote Access Security
**Risk: MEDIUM**
Remote access uses a 4-digit PIN (0000-9999) which is brute-forceable. Rate limiting exists (5 per IP, 20 global per 60s window) but the PIN space is small. Session path is 6 random bytes (12 hex chars) which is stronger. The web client loads xterm.js from CDN (jsdelivr) — a compromise of the CDN would compromise all remote sessions.

### 6. App.css Single File (3631 lines)
**Risk: LOW-MEDIUM**
All styles in one file with no scoping. Changing a class selector can have unintended effects. No CSS modules or scoping mechanism. Some duplication of selectors possible.

### 7. Config File Race Conditions
**Risk: LOW-MEDIUM**
`.forgeterm.json` is read and written without file locking. If the user edits the file externally while the app writes to it (or vice versa), data loss is possible. The `fs.watch` is used for change detection but has known reliability issues on macOS (may miss rapid changes).

### 8. No IPC Schema Validation
**Risk: LOW**
All IPC uses typed TypeScript interfaces but there is no runtime validation. A malformed message from a compromised preload (or bug) could cause unexpected behavior in main process handlers. The contextBridge provides isolation but doesn't validate message shapes.

### 9. node-pty Native Module
**Risk: LOW**
node-pty is a native C++ module requiring `@electron/rebuild`. Build failures can block development. Version mismatches between Node.js and Electron can cause silent crashes. Only affects development/build, not runtime.

### 10. cloudflared Dependency
**Risk: LOW**
Remote access requires external `cloudflared` binary. Not bundled with the app. Users must install via Homebrew. If cloudflared API changes or the binary is renamed, remote access silently fails.

### 11. GitNexus Index Drift
**Risk: LOW**
The GitNexus index (519 symbols, 1312 relationships) must be kept current. Running `npx gitnexus analyze` without `--embeddings` will destroy existing embeddings. No automated re-indexing.

## Technical Debt

- **Duplicate initialization logic:** App.tsx has two nearly identical init blocks (one for first load, one for `onProjectOpened`)
- **Inline SVG duplication:** Same SVGs repeated across Sidebar, App, and floating actions
- **Config reload on every change:** `config:changed` triggers full config reload (config + Claude launch) even for trivial changes
- **Global mutable state:** `terminals` Map, `dataHandlers` Map, `lastOutputAt` Map are module-level globals in TerminalView.tsx
- **Sync filesystem operations in main process:** `fs.readFileSync`, `fs.writeFileSync` used extensively—block the event loop for large files
- **Process tree snapshot:** Uses `execFileAsync('ps', ...)` which is async, but 4s timeout could delay conversation detection
