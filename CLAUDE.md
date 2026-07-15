# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is ForgeTerm

ForgeTerm is an Electron-based terminal emulator built with React, TypeScript, and xterm.js. It opens per-project windows with multiple terminal sessions, configurable themes, and per-project config files (`.forgeterm.json`).

## Commands

- `pnpm dev` - Start dev server with HMR (Vite + Electron)
- `pnpm build` - TypeScript check, Vite build, and electron-builder package
- `pnpm rebuild` - Rebuild native node-pty module for Electron

No test runner or linter is configured.

## Architecture

Three-layer Electron app: main process, preload bridge, renderer (React).

### Main process (`electron/`)
- `main.ts` - App lifecycle, window management, IPC handlers, config file loading/watching. Each window gets its own `PtyManager` instance scoped to a project directory.
- `preload.ts` - Exposes `window.forgeterm` API via contextBridge. All IPC goes through this typed interface.
- `ptyManager.ts` - Manages node-pty sessions (create, write, resize, kill, restart). One instance per window.

### Renderer (`src/`)
- `App.tsx` - Root component. Initializes sessions from config, handles keyboard shortcuts (Cmd+T new session, Cmd+K clear, Cmd+1-9 switch).
- `store/sessionStore.ts` - Zustand store for session state (list, active session, running status).
- `components/` - Sidebar, TerminalView (xterm.js wrapper), NewSessionModal, ThemeEditor.
- `themes.ts` - Built-in theme presets.

### Shared (`shared/`)
- `types.ts` - `ForgeTermConfig`, `SessionInfo`, and `ForgeTermAPI` interface shared between main and renderer.

### Config
Per-project `.forgeterm.json` files configure theme colors, font, window chrome, and predefined sessions. The main process watches this file and pushes changes to the renderer.

## Path alias
`@shared` maps to the `shared/` directory (configured in `vite.config.ts`).

## Key dependencies
- `node-pty` - Native PTY for terminal sessions (requires rebuild for Electron via `@electron/rebuild`)
- `@xterm/xterm` + `@xterm/addon-fit` - Terminal rendering
- `zustand` - State management
- `vite-plugin-electron` - Vite integration for Electron main/preload builds

## CLI entry
`bin/forgeterm.cjs` is the CLI entry point. The app accepts a directory path argument to open a project window.


<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **forgeterm** (897 symbols, 2075 relationships, 77 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/forgeterm/context` | Codebase overview, check index freshness |
| `gitnexus://repo/forgeterm/clusters` | All functional areas |
| `gitnexus://repo/forgeterm/processes` | All execution flows |
| `gitnexus://repo/forgeterm/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
