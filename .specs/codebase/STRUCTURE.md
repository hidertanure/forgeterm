# Directory Structure

```
forgeterm/
├── electron/                    # Main process (Node.js/Electron)
│   ├── main.ts                  # App lifecycle, window mgmt, IPC handlers (~3088 lines)
│   ├── preload.ts               # contextBridge API exposure (~373 lines)
│   ├── ptyManager.ts            # node-pty session lifecycle (~277 lines)
│   ├── remoteServer.ts          # Express + WebSocket remote access (+ cloudflared, ~638 lines)
│   ├── notificationServer.ts    # Unix socket CLI IPC server (~132 lines)
│   ├── updater.ts               # GitHub releases update provider (~327 lines)
│   ├── finderIntegration.ts     # macOS Finder Services workflows (~280 lines)
│   ├── electron-env.d.ts        # Electron type augmentations
│   └── remote-web/              # Static HTML/JS/CSS web client for remote access
│       ├── index.html
│       └── style.css
├── src/                         # Renderer process (React)
│   ├── main.tsx                 # React entry point (createRoot)
│   ├── App.tsx                  # Root component, initialization, keyboard shortcuts (~853 lines)
│   ├── App.css                  # All application styles (~3631 lines)
│   ├── index.css                # Global reset/scrollbar (~34 lines)
│   ├── vite-env.d.ts            # Vite type declarations
│   ├── themes.ts                # Color system: presets, terminal themes, utilities (~381 lines)
│   ├── store/
│   │   └── sessionStore.ts      # Zustand store for session state (~152 lines)
│   └── components/
│       ├── Sidebar.tsx          # Session list, context menu, controls (~516 lines)
│       ├── TerminalView.tsx     # xterm.js wrapper, search, drag-drop (~696 lines)
│       ├── Dashboard.tsx        # Command Center window (~191 lines)
│       ├── ProjectSwitcher.tsx  # Search projects/workspaces, import, multi-screen prefs (~963 lines)
│       ├── ProjectSettings.tsx  # Per-project config editor
│       ├── ThemeEditor.tsx      # Visual theme picker/editor
│       ├── EditWorkspaceModal.tsx # Workspace properties modal
│       ├── NewSessionModal.tsx  # Create session with presets
│       ├── SessionInfoPanel.tsx # Session detail panel (info, timeline, Claude) (~147 lines)
│       ├── SessionSearch.tsx    # Search across sessions
│       ├── GlobalSearch.tsx     # Cross-session content search
│       ├── HelpModal.tsx        # Help/shortcuts (renders markdown)
│       ├── CliInstallModal.tsx  # CLI tool installation
│       ├── ClaudeConnectionBanner.tsx # Claude integration status banner
│       ├── RemoteAccessModal.tsx # Remote access control panel
│       └── UpdateBanner.tsx     # Update available notification
├── shared/
│   └── types.ts                 # All shared TypeScript interfaces (~368 lines)
├── bin/
│   ├── forgeterm.cjs            # CLI entry (notify, open, list, help) (~271 lines)
│   ├── forgeterm-cli.sh         # Shell wrapper for CLI install
│   └── hooks/
│       └── report-activity.cjs  # Claude hook: reports session activity via ft CLI
├── build/                       # electron-builder resources (icons, entitlements)
├── patches/
│   └── dmg-builder.patch        # Patch for dmg-builder
├── docs/                        # Screenshots for README
├── public/                      # Static assets
├── release/                     # Release artifacts
├── dist/                        # Vite renderer build output
├── dist-electron/               # Vite main/preload build output
├── .specs/                      # Spec-driven development documents
│   └── codebase/                # Brownfield mapping (this directory)
├── vite.config.ts               # Vite + electron plugin config
├── tsconfig.json                # TypeScript config
├── tsconfig.node.json           # TypeScript config for node/Vite
├── package.json                 # Dependencies and scripts
├── electron-builder.json5       # electron-builder packaging config
└── .forgeterm.json              # Example/self-referential project config
```

## Size Metrics
- **Total source files:** ~40 TS/TSX files
- **Largest files:** main.ts (3088 lines), App.css (3631 lines), ProjectSwitcher.tsx (963 lines), App.tsx (853 lines)
- **Shared types:** 1 file (types.ts, 368 lines)
- **~519 symbols, 1312 relationships, 43 execution flows** (per GitNexus index)
