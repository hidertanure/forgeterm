# Integrations

## External Services

### GitHub Releases (Update Checking)
- **Provider:** GitHubReleaseProvider in `electron/updater.ts`
- **Repo:** `codama-dev/forgeterm`
- **API:** `https://api.github.com/repos/{owner}/{repo}/releases/latest`
- **Interval:** Every 6 hours + 30s after launch
- **Mechanism:** Compares semver, notifies renderer if newer
- **DMG download:** Direct from GitHub asset URL (with redirect following)
- **Install:** Spawns detached bash script that mounts DMG, copies .app, relaunches

### Cloudflare Tunnel (Remote Access)
- **Binary:** `cloudflared` (not bundled, user must install via Homebrew)
- **Resolved from:** `/opt/homebrew/bin/cloudflared`, `/usr/local/bin/cloudflared`, or `which`
- **Command:** `cloudflared tunnel --url http://127.0.0.1:{port} --no-autoupdate`
- **URL pattern:** `https://{random}-{random}.trycloudflare.com`
- **Timeout:** 30s for tunnel URL detection
- **Retry:** 1 retry (2 attempts total)

## Local Integrations

### Claude Code (`~/.claude/`)
- **CLAUDE.md injection:** Prompts user to add ForgeTerm integration section with version marker comment `<!-- forgeterm:v:{version} -->`
- **Session detection:** Reads `~/.claude/sessions/{pid}.json` to find conversation IDs
- **Activity hooks:** Installs `report-activity.cjs` into `~/.claude/hooks/forgeterm/` and registers in `~/.claude/settings.json` for UserPromptSubmit, Stop, Notification events
- **Resume command:** `claude --dangerously-skip-permissions --resume {conversationId}` (customizable)

### macOS Finder
- **Services integration:** Installs Automator workflows in `~/Library/Services/`
  - "Open in ForgeTerm" — opens selected folder as project
  - "Open as Workspace in ForgeTerm" — opens folder with subdirs as workspace
- **Script:** Calls `/usr/local/bin/forgeterm open` or `open-workspace`
- **Refresh:** Runs `/System/Library/CoreServices/pbs -update` after install/uninstall

### VS Code / Cursor / Windsurf (Project Manager)
- **Detection:** Scans known paths for Project Manager `projects.json` files
- **Supported editors:** VS Code, Cursor, Windsurf, VSCodium, VS Code Insiders
- **Paths checked:** macOS `~/Library/Application Support/{editor}/`, Linux `~/.config/{editor}/`, Windows `%APPDATA%/{editor}/`
- **Import format:** Project Manager JSON with name, rootPath, tags, enabled
- **Tag mapping:** Tags with ≥2 projects become workspaces
- **Idempotent:** Skips already-imported projects

### Peacock (VS Code Extension)
- **Sync:** Reads `.vscode/settings.json` for `peacock.color`
- **Auto-theme:** If no window theme set, derives window theme from Peacock color
- **Fallback:** If no Peacock color, assigns random preset theme ("Surprise me")

## CLI Tool

### Installation
- **Source:** `bin/forgeterm-cli.sh` → `/usr/local/bin/forgeterm`
- **Alias:** `/usr/local/bin/ft` → symlink to forgeterm
- **Permissions:** Via direct fs (if writable) or `osascript` with admin privileges
- **CLI entry:** `bin/forgeterm.cjs` (also used for direct Electron launch)

### Socket Communication
- **Path (macOS):** `~/Library/Application Support/ForgeTerm/forgeterm.sock`
- **Path (Linux):** `~/.config/ForgeTerm/forgeterm.sock`
- **Protocol:** JSON lines over Unix socket
- **Timeout:** 5 seconds per command

## Git Integration
- **Repo URL detection:** `git remote get-url origin` in project directory
- **Conversion:** SSH URLs converted to HTTPS
- **Opens in browser:** via `shell.openExternal()`

## System
- **PATH augmentation:** Desktop-launched apps get `/opt/homebrew/bin`, `/opt/homebrew/sbin`, `/usr/local/bin` added
- **Shell resolution:** `process.env.SHELL` or `/bin/zsh` (macOS) / `powershell.exe` (Windows)
- **Process tree:** `ps -axo pid=,ppid=` for Claude process detection (async, cached per interval)
