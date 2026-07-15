# Conventions

## Code Style

- **No comments** in source code (zero inline comments across all files)
- **No semicolons** — TypeScript strict mode, but semicolons omitted
- **Double quotes** for strings (consistent across the codebase)
- **Trailing commas** not used in most files (inconsistent across the codebase)
- **JSON.stringify with spaces** for all config file writes: `JSON.stringify(data, null, 2)`
- **Inline SVG** for all icons (no icon library, no SVG files)
- **React inline styles** for dynamic/themed styling, CSS classes for static styling

## Naming

- **Files:** PascalCase for components (Sidebar.tsx), camelCase for utilities (ptyManager.ts), kebab-case for config (electron-builder.json5)
- **Interfaces:** PascalCase, descriptive (ForgeTermConfig, SessionContext, WindowState)
- **Functions:** camelCase, action-oriented (focusOrCreateWindow, handleContextMenu)
- **Event handlers:** `handle` prefix (handleKeyDown, handleNewSession)
- **Callback props:** `on` prefix (onNewSession, onSave, onCancel)
- **React state:** `show` prefix for modals (showModal, showThemeEditor)
- **Refs:** `Ref` suffix (containerRef, initializedRef, configRef)
- **IPCs:** colon-separated noun:verb (session:create, config:changed)
- **PTY sessions:** `session-{number}` format IDs

## File Organization

- Imports: Node built-ins first, then external packages, then local modules
- Type imports separated from value imports (some files only)
- Exported utility functions at bottom of file (TerminalView.tsx pattern)

## Component Patterns

- Functional components with hooks (no class components)
- `useCallback` for all event handlers passed as props
- Single `useEffect` per concern (no mega-effects)
- Cleanup functions returned from all effects
- `useRef` for mutable state that shouldn't trigger re-renders
- Component state via local `useState` + Zustand store (no prop drilling beyond 2 levels)

## Error Handling

- Try/catch with empty catch blocks for expected failures (file not found, process exit)
- Errors logged via `console.error` (no structured logging)
- Error messages exposed to user via `dialog.showErrorBox` or modal state
- Silent failures for non-critical operations (Finder refresh, cache clear)

## State Management (Zustand)

- Single store (`sessionStore.ts`)
- State mutations via `set()` with functional updates `set((state) => ({...}))`
- Direct store access via `useSessionStore.getState()` for non-reactive reads
- No middleware, no persistence plugin (persistence handled in main process)

## TypeScript

- `strict: true` but `noUnusedLocals: false`, `noUnusedParameters: false`
- Shared types in `shared/types.ts` (single file, no barrel exports)
- Types imported with `import type` for type-only imports (some files)
- `Record<string, unknown>` used for dynamic objects (CLI payloads, config)
- Explicit `as` casts when needed (e.g., `as unknown as Record<string, unknown>`)

## CSS

- Single large CSS file (`App.css`, ~3600 lines)
- No CSS modules, no preprocessor
- CSS custom properties for dynamic theming (`--accent-color`)
- Dark theme only (no light mode support in most components)
- Animations via `@keyframes` (fade-in, slide-in, pulse, spin)

## IPC

- Main process handlers use `ipcMain.handle()` for request/response
- Main process uses `ipcMain.on()` for fire-and-forget
- Preload wraps all IPC with typed Promise/void return values
- Event listeners return cleanup functions (consistent pattern)
- `JSON.parse(JSON.stringify(...))` for serialization safety in preload

## Config Persistence

- All user data in `app.getPath('userData')`:
  - `recent-projects.json`
  - `workspaces.json`
  - `saved-sessions.json`
  - `favorite-themes.json`
  - `session-history/{md5-hash}.json`
  - `cli-prompt-dismissed.json`
  - `import-dismissed.json`
- Project configs in `{projectPath}/.forgeterm.json`
- All files written atomically (no temp files, no locking)
