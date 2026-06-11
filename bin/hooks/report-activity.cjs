#!/usr/bin/env node
/**
 * ForgeTerm activity hook
 *
 * Reports Claude's working state to ForgeTerm so the sidebar and Command Center
 * can show a loading indicator while Claude is working and a glowing
 * notification dot when it finishes (cleared once you visit the session).
 *
 * Registered on three Claude Code events, with the status passed as argv[2]:
 *   UserPromptSubmit -> working    Stop -> done    Notification -> attention
 *
 * No-op outside a ForgeTerm-spawned terminal (FORGETERM_SESSION_ID unset).
 * Fires `forgeterm activity <status>` fire-and-forget and ALWAYS exits 0, so it
 * can never delay or block a Claude turn even if ForgeTerm isn't running.
 */

const { spawn } = require('node:child_process')

// Only relevant inside a ForgeTerm-spawned terminal.
if (!process.env.FORGETERM_SESSION_ID || !process.env.FORGETERM_PROJECT_PATH) {
  process.exit(0)
}

const status = process.argv[2]
if (!status) process.exit(0)

try {
  const child = spawn('forgeterm', ['activity', status], { detached: true, stdio: 'ignore' })
  child.on('error', () => {})
  child.unref()
} catch {
  // never block a Claude turn
}

process.exit(0)
