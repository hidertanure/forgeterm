# Architecture

## Three-Layer Electron Architecture

```
┌──────────────────────────────────────────────────────┐
│  Renderer Process (React)                            │
│  src/App.tsx → components/* → store/sessionStore.ts  │
│  Communicates via window.forgeterm (preload API)     │
├──────────────────────────────────────────────────────┤
│  Preload Bridge (contextBridge)                      │
│  electron/preload.ts — typed ForgeTermAPI interface  │
│  Exposes IPC invoke/send/on as async methods         │
├──────────────────────────────────────────────────────┤
│  Main Process (Node.js)                              │
│  electron/main.ts — IPC handlers, window lifecycle   │
│  electron/ptyManager.ts — PTY session management     │
│  electron/notificationServer.ts — Unix socket IPC    │
│  electron/remoteServer.ts — Express/WS server        │
│  electron/updater.ts — GitHub release checker        │
└──────────────────────────────────────────────────────┘
```

## Window Management

Each **project directory** gets its own `BrowserWindow`. When the same project is opened again, the existing window is focused (`focusOrCreateWindow`).

```
windowStates: Map<windowId → { projectPath, ptyManager, configWatcher }>
```

**Window creation flow:**
1. `createProjectWindow(projectPath)` — creates BrowserWindow
2. `autoAssignThemeIfNeeded()` — Peacock sync or random theme
3. `saveRecentProject()` — persists to recent-projects.json
4. `watchConfig()` — watches `.forgeterm.json` for live changes
5. Loads Vite dev URL (dev) or built renderer (prod)

## IPC Communication

All IPC goes through typed `ForgeTermAPI` interface (shared/types.ts). The preload exposes methods as either:
- `ipcRenderer.invoke()` — request/response (handles)
- `ipcRenderer.send()` — fire-and-forget (on)
- `ipcRenderer.on()` — event listeners with cleanup

**Key IPC channels:**
| Channel | Direction | Pattern |
|---------|-----------|---------|
| `session:create` | renderer→main | invoke |
| `session:data` | main→renderer | send (push) |
| `session:exit` | main→renderer | send (push) |
| `session:write` | renderer→main | send (fire-and-forget) |
| `config:changed` | main→renderer | send (push) |
| `session:renamed` | main→renderer | send (CLI-driven) |
| `session:info-updated` | main→renderer | send (CLI-driven) |
| `session:context-updated` | main→renderer | send (CLI-driven) |
| `session:activity-updated` | main→renderer | send (CLI/Claude hook) |
| `notification:focus-session` | main→renderer | send (notification click) |
| `activity:report` | renderer→main | send (periodic status push) |

## PTY Session Lifecycle

```
PtyManager (one per window)
  ├── sessions: Map<sessionId → PtySession>
  │     ├── id, name, command, cwd, running
  │     ├── pty: IPty | null (node-pty instance)
  │     ├── info?: SessionContext (CLI-reported)
  │     └── conversationId?: string (Claude conversation)
  ├── createSession() → spawns shell via node-pty
  ├── restartSession() → kills old PTY, spawns new one
  ├── write/resize/kill/remove/rename
  └── addDataListener/addExitListener (for remote WS)
```

**Environment variables injected into each PTY:**
- `FORGETERM=1`
- `FORGETERM_PROJECT_PATH` — project root
- `FORGETERM_SESSION_ID` — session UUID
- `FORGETERM_SESSION_NAME` — display name
- `FORGETERM_SOCKET` — Unix socket path (for CLI)

## Config System

Per-project `.forgeterm.json` files in project root directories.

**Config loading precedence:**
1. `.forgeterm.json` in project directory
2. `DEFAULT_CONFIG` fallback (midnight theme, dark terminal)

**Config watching:** `fs.watch()` on the config file (falls back to directory watch if file doesn't exist). Changes pushed to renderer via `config:changed` IPC.

**Watcher stored per window** in `windowStates` → `configWatcher`. Cleaned up on window close.

## CLI Communication (Unix Socket)

```
┌──────────┐   Unix socket    ┌──────────────────┐
│ bin/     │   JSON lines     │ NotificationServer│
│ ft CLI   │←────────────────→│ (net.Server)      │
│          │                  │ handlers map      │
└──────────┘                  └──────────────────┘
```

The `ft` CLI sends JSON commands over `/Users/{user}/Library/Application Support/ForgeTerm/forgeterm.sock`. The `NotificationServer` parses commands and dispatches to registered handlers. Responses are JSON lines.

**Commands:** notify, rename, close, info, context, conversation, activity, open, dashboard, session-*, workspace-*, config-*, theme-*, and more.

## Remote Access Architecture

```
Browser ←──HTTPS──→ cloudflared ←──HTTP──→ Express (127.0.0.1)
                              ←──WSS───→ WebSocket (terminal I/O)
```

1. `RemoteServer.start()` creates Express HTTP server + WebSocketServer
2. Generates random PIN (4 digits) + session path (12 hex chars)
3. All routes scoped under `/s/{sessionPath}/`
4. Auth via HttpOnly cookie after PIN verification
5. Terminal I/O via WebSocket proxy (bidirectional PTY ↔ browser)
6. `startTunnel()` spawns `cloudflared tunnel` for public HTTPS URL

## Claude Code Integration

**Conversation detection:**
- Periodic `detectConversationIds()` — async `ps` snapshot → walk process tree → find `~/.claude/sessions/{pid}.json`
- Also via `SessionStart` hook (not shown in code but referenced)
- Runs every 15 seconds for sessions without known conversation IDs

**Activity reporting:**
- Claude hooks installed in `~/.claude/settings.json` (UserPromptSubmit → working, Stop → done, Notification → attention)
- Hook script: `bin/hooks/report-activity.cjs` → calls `ft activity {status}`
- Also works via CLI: `ft activity working|done|attention|idle`

**Session info:**
- CLI-driven: `ft info --title "..." --summary "..." --last "..." --action "..."`
- Stored in `PtySession.info` and persisted to saved sessions
- Timeline capped at 50 entries

**Context usage:**
- `ft context <0-100>` reports context window usage percentage
- Visualized as ring indicator around session dot in sidebar

## State Persistence

**Saved sessions** (`saved-sessions.json`):
- Debounced save (800ms) after create/delete/rename/info/convo changes
- Saved on window close
- Restored on window open (Claude sessions come up stopped/idle)
- Stale entries (>7 days) cleaned on startup

**Session history** (`session-history/{hash}.json`):
- Appended when window closes
- Cleaned on startup (>60 days deleted)
- Searchable via `searchHistory()`

**Recent projects** (`recent-projects.json`):
- Updated on project open
- Also stores sidebar mode, sidebar width per project

**Workspaces** (`workspaces.json`):
- CRUD via CLI and renderer

## Dashboard

A special window (`?mode=dashboard`) that shows:
- Workspace cards with project status (open/closed, session counts)
- Standalone projects (open but no workspace)
- Session search (Cmd+F)
- State pushed every 2 seconds from main process

## Window Tiling

`calculateTilePositions()` distributes windows across displays:
- 1 window: full screen
- 2: side by side
- 3: master left, 2 stacked right
- 4: 2x2 grid
- 5: 3 top, 2 bottom
- 6+: 3x2 grid
- Multi-display: distributes evenly, respects `workspace.screenPrefs`
